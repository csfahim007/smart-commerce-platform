<?php

namespace App\Services;

use App\Events\OrderPlaced;
use App\Models\Cart;
use App\Models\Order;
use App\Models\User;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class OrderService
{
    public function placeOrder(User $user, array $data): Order
    {
        $order = DB::transaction(function () use ($user, $data) {
            $cart = Cart::where('user_id', $user->id)
                ->with('items')
                ->lockForUpdate()
                ->first();

            if (! $cart || $cart->items->isEmpty()) {
                throw new RuntimeException('Cart is empty.');
            }

            /*
             * Lock every product row before checking stock.
             *
             * This prevents two concurrent checkout requests from
             * both seeing the same remaining stock.
             */
            $items = $cart->items;

            $products = [];

            foreach ($items as $item) {
                $product = $item->product()
                    ->lockForUpdate()
                    ->first();

                if (! $product || ! $product->is_active) {
                    throw new RuntimeException(
                        'One of the products in your cart is no longer available.'
                    );
                }

                if ($item->quantity > $product->stock) {
                    throw new RuntimeException(
                        "Insufficient stock for {$product->name}."
                    );
                }

                $products[$item->id] = $product;
            }

            $subtotal = 0;

            foreach ($items as $item) {
                $product = $products[$item->id];

                $subtotal += $item->quantity * $product->price;
            }

            $shippingCost = 0;
            $total = $subtotal + $shippingCost;

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'shipping_name' => $data['shipping_name'] ?? $user->name,
                'shipping_phone' => $data['shipping_phone'] ?? null,
                'shipping_address' => $data['shipping_address'],
                'payment_method' => $data['payment_method'],
            ]);

            Payment::create([
                'order_id' => $order->id,
                'method' => $data['payment_method'],
                'payment_method' => $data['payment_method'],
                'status' => 'pending',
                'amount' => $total,
            ]);

            foreach ($items as $item) {
                $product = $products[$item->id];

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $product->price,
                    'unit_price' => $product->price,
                    'quantity' => $item->quantity,
                ]);

                /*
                 * Stripe payments are not finalized yet.
                 *
                 * Stock is reduced only after Stripe confirms payment
                 * through payment_intent.succeeded.
                 */
                if ($data['payment_method'] !== 'stripe') {
                    $product->decrement('stock', $item->quantity);
                }
            }

            /*
             * For Stripe, keep the cart until payment succeeds.
             * For COD, the order is already finalized, so clear it now.
             */
            if ($data['payment_method'] !== 'stripe') {
                $cart->items()->delete();
            }

            return $order;
        });

        /*
         * Stripe orders are not considered completed yet.
         * The Stripe webhook will dispatch OrderPlaced after payment succeeds.
         */
        if ($data['payment_method'] !== 'stripe') {
            OrderPlaced::dispatch($order);
        }

        return $order;
    }
}
