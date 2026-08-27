<?php

namespace Tests\Feature\Api\V1;

use App\Events\OrderPlaced;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        Http::fake();
    }

    public function test_guest_cannot_view_orders(): void
    {
        $response = $this->getJson('/api/v1/orders');

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_view_orders(): void
    {
        $user = User::factory()->create();

        Order::factory()->count(2)->create([
            'user_id' => $user->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/orders');

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_user_can_place_order_from_cart(): void
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

        $response = $this->postJson('/api/v1/orders', [
            'shipping_name' => 'Test Customer',
            'shipping_phone' => '01700000000',
            'shipping_address' => 'Dhaka, Bangladesh',
            'payment_method' => 'cash_on_delivery',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
        ]);
    }

    public function test_order_snapshots_product_name_and_price(): void
    {
        $user = User::factory()->create();

        $product = Product::factory()->create([
            'name' => 'Original Product',
            'price' => 1000,
            'stock' => 10,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertOk();

        $this->postJson('/api/v1/orders', [
            'shipping_name' => 'Test Customer',
            'shipping_phone' => '01700000000',
            'shipping_address' => 'Dhaka, Bangladesh',
            'payment_method' => 'cash_on_delivery',
        ])->assertCreated();

        $product->update([
            'name' => 'Changed Product',
            'price' => 2000,
        ]);

        $this->assertDatabaseHas('order_items', [
            'product_name' => 'Original Product',
            'price' => 1000,
        ]);
    }

    public function test_cart_is_cleared_after_order_is_placed(): void
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

        $this->postJson('/api/v1/orders', [
            'shipping_name' => 'Test Customer',
            'shipping_phone' => '01700000000',
            'shipping_address' => 'Dhaka, Bangladesh',
            'payment_method' => 'cash_on_delivery',
        ])->assertCreated();

        $this->assertDatabaseMissing('cart_items', [
            'product_id' => $product->id,
        ]);
    }

    public function test_user_cannot_place_order_when_stock_is_insufficient(): void
    {
        $user = User::factory()->create();

        $product = Product::factory()->create([
            'stock' => 1,
        ]);

        Sanctum::actingAs($user);

        $cartItem = CartItem::factory()->create([
            'quantity' => 5,
            'product_id' => $product->id,
        ]);
        $cartItem->cart->update(['user_id' => $user->id]);

        $response = $this->postJson('/api/v1/orders', [
            'shipping_name' => 'Test Customer',
            'shipping_phone' => '01700000000',
            'shipping_address' => 'Dhaka, Bangladesh',
            'payment_method' => 'cash_on_delivery',
        ]);

        $response->assertUnprocessable();

        $this->assertDatabaseMissing('orders', [
            'user_id' => $user->id,
        ]);
    }

    public function test_user_cannot_view_another_users_order(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $userA->id,
        ]);

        Sanctum::actingAs($userB);

        $response = $this->getJson("/api/v1/orders/{$order->id}");

        $response->assertForbidden();
    }

    public function test_user_can_view_own_order(): void
    {
        $user = User::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/orders/{$order->id}");

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $order->id);
    }

    public function test_placing_order_dispatches_order_placed_event(): void
    {
        Event::fake([OrderPlaced::class]);

        $user = User::factory()->create();

        $product = Product::factory()->create([
            'price' => 1000,
            'stock' => 10,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertOk();

        $this->postJson('/api/v1/orders', [
            'shipping_name' => 'Test Customer',
            'shipping_phone' => '01700000000',
            'shipping_address' => 'Dhaka, Bangladesh',
            'payment_method' => 'cash_on_delivery',
        ])->assertCreated();

        Event::assertDispatched(OrderPlaced::class);
    }

    public function test_order_placed_event_can_be_dispatched_to_real_queue(): void
    {
        $order = Order::factory()->create();

        OrderPlaced::dispatch($order);

        $this->assertTrue(true);
    }

    public function test_order_cannot_be_placed_when_stock_is_depleted(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $product = Product::factory()->create([
            'price' => 5000,
            'stock' => 1,
        ]);

        // User A adds the unit to cart while stock is 1
        Sanctum::actingAs($userA);
        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertOk();

        // User B also adds the unit to cart while stock is still 1
        Sanctum::actingAs($userB);
        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertOk();

        // User A places the order first, depleting stock to 0
        Sanctum::actingAs($userA);
        $responseA = $this->postJson('/api/v1/orders', [
            'shipping_name' => 'Customer A',
            'shipping_phone' => '01700000001',
            'shipping_address' => 'Dhaka, Bangladesh',
            'payment_method' => 'cash_on_delivery',
        ]);
        $responseA->assertCreated();

        // User B attempts to place order now that stock is depleted
        Sanctum::actingAs($userB);
        $responseB = $this->postJson('/api/v1/orders', [
            'shipping_name' => 'Customer B',
            'shipping_phone' => '01700000002',
            'shipping_address' => 'Dhaka, Bangladesh',
            'payment_method' => 'cash_on_delivery',
        ]);

        $responseB->assertUnprocessable();

        $this->assertDatabaseCount('orders', 1);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 0,
        ]);
    }
}
