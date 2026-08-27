<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'method' => fake()->randomElement([
                'cash_on_delivery',
                'mock_payment',
            ]),
            'status' => 'pending',
            'transaction_id' => null,
            'amount' => fake()->randomFloat(2, 20, 5000),
            'paid_at' => null,
        ];
    }
}
