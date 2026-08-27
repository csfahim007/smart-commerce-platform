<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_products(): void
    {
        Product::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/products');

        $response
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_guest_can_view_product(): void
    {
        $product = Product::factory()->create();

        $response = $this->getJson("/api/v1/products/{$product->id}");

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $product->id);
    }

    public function test_missing_product_returns_not_found(): void
    {
        $response = $this->getJson('/api/v1/products/999999');

        $response->assertNotFound();
    }

    public function test_admin_can_create_product(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $category = Category::factory()->create();

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/products', [
            'category_id' => $category->id,
            'name' => 'Test Laptop',
            'slug' => 'test-laptop',
            'sku' => 'TEST-LAPTOP-001',
            'description' => 'A test product.',
            'price' => 80000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Test Laptop');

        $this->assertDatabaseHas('products', [
            'slug' => 'test-laptop',
            'sku' => 'TEST-LAPTOP-001',
        ]);
    }

    public function test_customer_cannot_create_product(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        Sanctum::actingAs($customer);

        $response = $this->postJson('/api/v1/products', [
            'name' => 'Unauthorized Product',
            'slug' => 'unauthorized-product',
            'sku' => 'UNAUTHORIZED-001',
            'price' => 100,
        ]);

        $response->assertForbidden();
    }

    public function test_guest_cannot_create_product(): void
    {
        $response = $this->postJson('/api/v1/products', [
            'name' => 'Guest Product',
            'slug' => 'guest-product',
            'sku' => 'GUEST-001',
            'price' => 100,
        ]);

        $response->assertUnauthorized();
    }

    public function test_admin_can_update_product(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $product = Product::factory()->create([
            'name' => 'Original Product',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/v1/products/{$product->id}", [
            'name' => 'Updated Product',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Product');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Product',
        ]);
    }

    public function test_customer_cannot_update_product(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $product = Product::factory()->create();

        Sanctum::actingAs($customer);

        $response = $this->putJson("/api/v1/products/{$product->id}", [
            'name' => 'Unauthorized Update',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_delete_product(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $product = Product::factory()->create();

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/v1/products/{$product->id}");

        $response
            ->assertOk()
            ->assertJson([
                'message' => 'Product deleted successfully.',
            ]);

        $this->assertSoftDeleted('products', [
            'id' => $product->id,
        ]);
    }

    public function test_customer_cannot_delete_product(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $product = Product::factory()->create();

        Sanctum::actingAs($customer);

        $response = $this->deleteJson("/api/v1/products/{$product->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
        ]);
    }

    public function test_admin_cannot_create_product_with_duplicate_slug(): void
{
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $category = Category::factory()->create();

    Product::factory()->create([
        'slug' => 'existing-product',
    ]);

    Sanctum::actingAs($admin);

    $response = $this->postJson('/api/v1/products', [
        'category_id' => $category->id,
        'name' => 'New Product',
        'slug' => 'existing-product',
        'sku' => 'NEW-SKU-001',
        'price' => 100,
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['slug']);
}

public function test_admin_cannot_create_product_with_duplicate_sku(): void
{
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $category = Category::factory()->create();

    Product::factory()->create([
        'sku' => 'EXISTING-SKU',
    ]);

    Sanctum::actingAs($admin);

    $response = $this->postJson('/api/v1/products', [
        'category_id' => $category->id,
        'name' => 'New Product',
        'slug' => 'new-product',
        'sku' => 'EXISTING-SKU',
        'price' => 100,
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['sku']);
}

public function test_admin_cannot_create_product_with_negative_price(): void
{
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    Sanctum::actingAs($admin);

    $response = $this->postJson('/api/v1/products', [
        'name' => 'Invalid Product',
        'slug' => 'invalid-product',
        'sku' => 'INVALID-001',
        'price' => -100,
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['price']);
}

public function test_admin_cannot_create_product_with_negative_stock(): void
{
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    Sanctum::actingAs($admin);

    $response = $this->postJson('/api/v1/products', [
        'name' => 'Invalid Stock Product',
        'slug' => 'invalid-stock-product',
        'sku' => 'INVALID-STOCK-001',
        'price' => 100,
        'stock' => -1,
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['stock']);
}

public function test_admin_can_update_product_and_slug_is_generated_from_new_name(): void
{
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $product = Product::factory()->create([
        'name' => 'Original Product',
        'slug' => 'original-product',
    ]);

    Sanctum::actingAs($admin);

    $response = $this->putJson("/api/v1/products/{$product->id}", [
        'name' => 'Updated Product',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.name', 'Updated Product')
        ->assertJsonPath('data.slug', 'updated-product');
}
public function test_guest_can_filter_products_by_category(): void
{
    $categoryA = Category::factory()->create();
    $categoryB = Category::factory()->create();

    Product::factory()->count(2)->create([
        'category_id' => $categoryA->id,
    ]);

    Product::factory()->create([
        'category_id' => $categoryB->id,
    ]);

    $response = $this->getJson(
        "/api/v1/products?category_id={$categoryA->id}"
    );

    $response
        ->assertOk()
        ->assertJsonCount(2, 'data');

    foreach ($response->json('data') as $product) {
        $this->assertEquals($categoryA->id, $product['category_id']);
    }
}

public function test_guest_can_search_products_by_name(): void
{
    Product::factory()->create([
        'name' => 'MacBook Pro',
        'slug' => 'macbook-pro',
        'sku' => 'MACBOOK-PRO',
    ]);

    Product::factory()->create([
        'name' => 'Gaming Mouse',
        'slug' => 'gaming-mouse',
        'sku' => 'GAMING-MOUSE',
    ]);

    $response = $this->getJson('/api/v1/products?search=MacBook');

    $response
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'MacBook Pro');
}

public function test_guest_can_filter_products_by_active_status(): void
{
    Product::factory()->create([
        'name' => 'Active Product',
        'slug' => 'active-product',
        'sku' => 'ACTIVE-001',
        'is_active' => true,
    ]);

    Product::factory()->create([
        'name' => 'Inactive Product',
        'slug' => 'inactive-product',
        'sku' => 'INACTIVE-001',
        'is_active' => false,
    ]);

    $response = $this->getJson('/api/v1/products?is_active=1');

    $response
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Active Product');
}

public function test_guest_can_paginate_products(): void
{
    Product::factory()->count(15)->create();

    $response = $this->getJson('/api/v1/products?per_page=5');

    $response
        ->assertOk()
        ->assertJsonCount(5, 'data')
        ->assertJsonStructure([
            'data',
            'links',
            'meta',
        ]);
}
}
