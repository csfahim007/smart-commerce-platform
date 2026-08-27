<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 20, 5000);
        $shippingCost = fake()->randomFloat(2, 0, 100);

        return [
            'user_id' => User::factory(),
            'order_number' => 'ORD-'.strtoupper(fake()->unique()->bothify('######??')),
            'status' => 'pending',
            'subtotal' => $subtotal,
            'shipping_cost' => $shippingCost,
            'total' => $subtotal + $shippingCost,
            'shipping_address' => fake()->address(),
            'deleted_at' => null,
        ];
    }
}
