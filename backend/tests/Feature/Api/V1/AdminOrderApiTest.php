<?php

namespace Tests\Feature\Api\V1;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminOrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_view_admin_orders(): void
    {
        $response = $this->getJson('/api/v1/admin/orders');

        $response->assertUnauthorized();
    }

    public function test_customer_cannot_view_admin_orders(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        Sanctum::actingAs($customer);

        $response = $this->getJson('/api/v1/admin/orders');

        $response->assertForbidden();
    }

    public function test_admin_can_view_all_orders(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $user = User::factory()->create();

        Order::factory()->count(3)->create([
            'user_id' => $user->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/orders');

        $response
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_update_order_status(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $order = Order::factory()->create([
            'status' => 'pending',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson(
            "/api/v1/admin/orders/{$order->id}/status",
            [
                'status' => 'confirmed',
            ]
        );

        $response
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_customer_cannot_update_order_status(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $order = Order::factory()->create([
            'status' => 'pending',
        ]);

        Sanctum::actingAs($customer);

        $response = $this->putJson(
            "/api/v1/admin/orders/{$order->id}/status",
            [
                'status' => 'confirmed',
            ]
        );

        $response->assertForbidden();

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_cannot_set_invalid_order_status(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $order = Order::factory()->create([
            'status' => 'pending',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson(
            "/api/v1/admin/orders/{$order->id}/status",
            [
                'status' => 'invalid-status',
            ]
        );

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['status']);
    }
}
