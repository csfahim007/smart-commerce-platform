<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => fake()->unique()->slug(3),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-####??')),
            'description' => fake()->optional()->paragraph(),
            'price' => fake()->randomFloat(2, 10, 5000),
            'stock' => fake()->numberBetween(0, 100),
            'is_active' => true,
            'deleted_at' => null,
        ];
    }
}
