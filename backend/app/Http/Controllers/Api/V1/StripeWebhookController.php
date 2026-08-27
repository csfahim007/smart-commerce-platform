<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\OrderPlaced;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use UnexpectedValueException;

class StripeWebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        if (! $signature || ! $webhookSecret) {
            return response('Webhook configuration missing.', 400);
        }

        try {
            $event = Webhook::constructEvent(
                $payload,
                $signature,
                $webhookSecret
            );
        } catch (UnexpectedValueException) {
            return response('Invalid payload.', 400);
        } catch (SignatureVerificationException) {
            return response('Invalid signature.', 400);
        }

        try {
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $this->handlePaymentSucceeded($event);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentFailed($event);
                    break;
            }
        } catch (\Throwable $e) {
            Log::error('Stripe webhook processing failed.', [
                'event_id' => $event->id,
                'event_type' => $event->type,
                'message' => $e->getMessage(),
            ]);

            return response('Webhook processing failed.', 500);
        }

        return response('Webhook received.', 200);
    }

    private function handlePaymentSucceeded(object $event): void
    {
        $paymentIntent = $event->data->object;

        $orderPlaced = false;

        DB::transaction(function () use ($paymentIntent, &$orderPlaced) {
            $payment = Payment::where(
                'transaction_id',
                $paymentIntent->id
            )
                ->with('order')
                ->lockForUpdate()
                ->first();

            if (! $payment) {
                Log::warning('Stripe PaymentIntent has no matching payment.', [
                    'payment_intent_id' => $paymentIntent->id,
                ]);

                return;
            }

            if ($payment->status === 'paid') {
                return;
            }

            $stripeAmount = (int) $paymentIntent->amount;

            $expectedAmount = (int) round(
                ((float) $payment->amount) * 100
            );

            if ($stripeAmount !== $expectedAmount) {
                throw new \RuntimeException(
                    'Stripe payment amount does not match the local payment.'
                );
            }

            $order = $payment->order;

            if (! $order) {
                throw new \RuntimeException(
                    'Payment has no matching order.'
                );
            }

            /*
             * Lock products while finalizing the paid order.
             */
            foreach ($order->items as $item) {
                $product = $item->product()
                    ->lockForUpdate()
                    ->first();

                if (! $product || ! $product->is_active) {
                    throw new \RuntimeException(
                        "Product for order item {$item->id} is unavailable."
                    );
                }

                if ($item->quantity > $product->stock) {
                    throw new \RuntimeException(
                        "Insufficient stock for {$product->name}."
                    );
                }

                $product->decrement('stock', $item->quantity);
            }

            $payment->update([
                'status' => 'paid',
                'paid_at' => $payment->paid_at ?? now(),
            ]);

            $order->update([
                'status' => 'paid',
            ]);

            /*
             * Now that payment is confirmed, clear the user's cart.
             */
            $cart = \App\Models\Cart::where(
                'user_id',
                $order->user_id
            )
                ->lockForUpdate()
                ->first();

            if ($cart) {
                $cart->items()->delete();
            }

            $orderPlaced = true;
        });

        /*
         * Dispatch only after the transaction succeeds.
         * This triggers the existing email + n8n workflow once.
         */
        if ($orderPlaced) {
            $payment = Payment::where(
                'transaction_id',
                $paymentIntent->id
            )->with('order')->first();

            if ($payment?->order) {
                OrderPlaced::dispatch($payment->order);

                Log::info('Stripe payment completed and order finalized.', [
                    'payment_intent_id' => $paymentIntent->id,
                    'payment_id' => $payment->id,
                    'order_id' => $payment->order_id,
                ]);
            }
        }
    }

    private function handlePaymentFailed(object $event): void
    {
        $paymentIntent = $event->data->object;

        $payment = Payment::where(
            'transaction_id',
            $paymentIntent->id
        )->first();

        if (! $payment) {
            Log::warning(
                'Stripe failed PaymentIntent has no matching payment.',
                [
                    'payment_intent_id' => $paymentIntent->id,
                ]
            );

            return;
        }

        if ($payment->status === 'paid') {
            return;
        }

        $payment->update([
            'status' => 'failed',
        ]);

        Log::info('Stripe payment marked as failed.', [
            'payment_intent_id' => $paymentIntent->id,
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
        ]);
    }
}
