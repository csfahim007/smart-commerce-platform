<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductAssistantApiTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGroq(
        string $response = 'Mocked AI assistant response.',
        int $status = 200
    ): void {
        Http::fake([
            '*/chat/completions' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => $response,
                        ],
                    ],
                ],
            ], $status),
        ]);
    }

    private function createLaptopCategory(): Category
    {
        return Category::factory()->create([
            'name' => 'Laptop',
            'slug' => 'laptop',
            'is_active' => true,
        ]);
    }

    public function test_guest_cannot_use_product_assistant(): void
    {
        $response = $this->postJson('/api/v1/ai/product-assistant', [
            'message' => 'Show me laptops',
        ]);

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_use_product_assistant(): void
    {
        $this->fakeGroq();

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/ai/product-assistant', [
            'message' => 'Show me laptops',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'message',
                    'products',
                ],
            ]);
    }

    public function test_budget_filter_excludes_products_above_budget(): void
    {
        $this->fakeGroq();

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $laptopCategory = $this->createLaptopCategory();

        Product::factory()->create([
            'category_id' => $laptopCategory->id,
            'name' => 'Cheap Laptop',
            'price' => 5000,
            'stock' => 5,
            'is_active' => true,
        ]);

        Product::factory()->create([
            'category_id' => $laptopCategory->id,
            'name' => 'Expensive Laptop',
            'price' => 15000,
            'stock' => 5,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/ai/product-assistant', [
            'message' => 'laptop under 6000 BDT',
        ]);

        $response->assertOk()
            ->assertJsonCount(1, 'data.products')
            ->assertJsonPath('data.products.0.name', 'Cheap Laptop');
    }

    public function test_inactive_products_are_excluded(): void
    {
        $this->fakeGroq();

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Product::factory()->create([
            'name' => 'Inactive Laptop',
            'price' => 5000,
            'stock' => 5,
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/v1/ai/product-assistant', [
            'message' => 'laptop under 6000 BDT',
        ]);

        $response->assertOk()
            ->assertJsonCount(0, 'data.products');
    }

    public function test_out_of_stock_products_are_excluded(): void
    {
        $this->fakeGroq();

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Product::factory()->create([
            'name' => 'Out of Stock Laptop',
            'price' => 5000,
            'stock' => 0,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/ai/product-assistant', [
            'message' => 'laptop under 6000 BDT',
        ]);

        $response->assertOk()
            ->assertJsonCount(0, 'data.products');
    }

    public function test_no_matching_products_returns_empty_products(): void
    {
        $this->fakeGroq();

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/ai/product-assistant', [
            'message' => 'nonexistent product search query',
        ]);

        $response->assertOk()
            ->assertJsonCount(0, 'data.products');
    }

    public function test_groq_response_is_returned(): void
    {
        $this->fakeGroq('Test Laptop is available for 5000 BDT.');

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Product::factory()->create([
            'category_id' => $this->createLaptopCategory()->id,
            'name' => 'Test Laptop',
            'price' => 5000,
            'stock' => 5,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/ai/product-assistant', [
            'message' => 'laptop under 6000 BDT',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.message', 'Test Laptop is available for 5000 BDT.');
    }

    public function test_empty_groq_response_uses_fallback(): void
    {
        $this->fakeGroq('');

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Product::factory()->create([
            'category_id' => $this->createLaptopCategory()->id,
            'name' => 'Fallback Laptop',
            'price' => 5000,
            'stock' => 5,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/ai/product-assistant', [
            'message' => 'laptop under 6000 BDT',
        ]);

        $response->assertOk()
            ->assertJsonPath(
                'data.message',
                '* **Fallback Laptop** — ৳5,000.00 (Stock: 5)'
            );
    }

    public function test_groq_failure_returns_service_unavailable(): void
    {
        $this->fakeGroq('Failed', 500);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $laptopCategory = $this->createLaptopCategory();

        Product::factory()->create([
            'category_id' => $laptopCategory->id,
            'name' => 'Fallback Laptop',
            'price' => 5000,
            'stock' => 5,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/ai/product-assistant', [
            'message' => 'laptop under 6000 BDT',
        ]);

        $response->assertOk()
            ->assertJsonPath(
                'data.message',
                '* **Fallback Laptop** — ৳5,000.00 (Stock: 5)'
            );
    }

    public function test_message_is_required(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/ai/product-assistant', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['message']);
    }

    public function test_message_cannot_exceed_2000_characters(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/ai/product-assistant', [
            'message' => str_repeat('a', 2001),
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['message']);
    }
}
