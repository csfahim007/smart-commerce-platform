<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class StripePaymentController extends Controller
{
    public function createIntent(
        Request $request,
        Order $order
    ): JsonResponse {
        $user = $request->user();

        if ($order->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        if ($order->payment_method !== 'stripe') {
            return response()->json([
                'message' => 'This order does not use Stripe.',
            ], 422);
        }

        $payment = $order->payment;

        if (! $payment) {
            return response()->json([
                'message' => 'Payment record not found.',
            ], 404);
        }

        if ($payment->status === 'paid') {
            return response()->json([
                'message' => 'Payment has already been completed.',
            ], 422);
        }

        $stripe = new StripeClient(
            config('services.stripe.secret')
        );

        $amount = (int) round(
            ((float) $order->total) * 100
        );

        $paymentIntent = $stripe->paymentIntents->create([
            'amount' => $amount,
            'currency' => 'bdt',
            'automatic_payment_methods' => [
                'enabled' => true,
            ],
            'metadata' => [
                'order_id' => (string) $order->id,
                'order_number' => $order->order_number,
                'user_id' => (string) $user->id,
            ],
        ]);

        $payment->update([
            'transaction_id' => $paymentIntent->id,
        ]);

        return response()->json([
            'client_secret' => $paymentIntent->client_secret,
            'payment_intent_id' => $paymentIntent->id,
        ]);
    }
}
