<?php

namespace Tests\Feature\Api\V1;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_view_cart(): void
    {
        $response = $this->getJson('/api/v1/cart');

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_view_empty_cart(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/cart');

        $response
            ->assertOk()
            ->assertJsonPath('data.items', []);
    }

    public function test_authenticated_user_can_add_product_to_cart(): void
    {
        $user = User::factory()->create();

        $product = Product::factory()->create([
            'price' => 1000,
            'stock' => 10,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
    }

    public function test_adding_same_product_increases_quantity(): void
    {
        $user = User::factory()->create();

        $product = Product::factory()->create([
            'price' => 1000,
            'stock' => 10,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertOk();

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 3,
        ])->assertOk();

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 5,
        ]);
    }

    public function test_user_cannot_add_more_than_available_stock(): void
    {
        $user = User::factory()->create();

        $product = Product::factory()->create([
            'price' => 1000,
            'stock' => 3,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 4,
        ]);

        $response->assertUnprocessable();
    }

    public function test_cart_calculates_total(): void
    {
        $user = User::factory()->create();

        $productA = Product::factory()->create([
            'price' => 1000,
            'stock' => 10,
        ]);

        $productB = Product::factory()->create([
            'price' => 2500,
            'stock' => 10,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $productA->id,
            'quantity' => 2,
        ])->assertOk();

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $productB->id,
            'quantity' => 1,
        ])->assertOk();

        $response = $this->getJson('/api/v1/cart');

        $response
            ->assertOk()
            ->assertJsonPath('data.total', '4500.00');
    }

    public function test_user_can_update_cart_item_quantity(): void
    {
        $user = User::factory()->create();

        $product = Product::factory()->create([
            'price' => 1000,
            'stock' => 10,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertOk();

        $cartItem = CartItem::where('product_id', $product->id)->first();

        $response = $this->putJson(
            "/api/v1/cart/items/{$cartItem->id}",
            ['quantity' => 5]
        );

        $response->assertOk();

        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 5,
        ]);
    }

    public function test_user_can_remove_cart_item(): void
    {
        $user = User::factory()->create();

        $product = Product::factory()->create([
            'stock' => 10,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertOk();

        $cartItem = CartItem::where('product_id', $product->id)->first();

        $response = $this->deleteJson(
            "/api/v1/cart/items/{$cartItem->id}"
        );

        $response->assertOk();

        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItem->id,
        ]);
    }

    public function test_users_cannot_access_another_users_cart_item(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $product = Product::factory()->create([
            'stock' => 10,
        ]);

        $cart = Cart::factory()->create([
            'user_id' => $userA->id,
        ]);

        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        Sanctum::actingAs($userB);

        $response = $this->deleteJson(
            "/api/v1/cart/items/{$cartItem->id}"
        );

        $response->assertForbidden();

        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
        ]);
    }
}
