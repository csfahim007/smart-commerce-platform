<?php

namespace Tests\Feature\Api\V1;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_view_payment(): void
    {
        $order = Order::factory()->create();

        $response = $this->getJson("/api/v1/orders/{$order->id}/payment");

        $response->assertUnauthorized();
    }

    public function test_user_can_view_own_payment(): void
    {
        $user = User::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
        ]);

        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'payment_method' => 'cash_on_delivery',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson(
            "/api/v1/orders/{$order->id}/payment"
        );

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $payment->id);
    }

    public function test_user_cannot_view_another_users_payment(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $owner->id,
        ]);

        Payment::factory()->create([
            'order_id' => $order->id,
        ]);

        Sanctum::actingAs($otherUser);

        $response = $this->getJson(
            "/api/v1/orders/{$order->id}/payment"
        );

        $response->assertForbidden();
    }

    public function test_admin_can_view_order_payment(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $user = User::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
        ]);

        $payment = Payment::factory()->create([
            'order_id' => $order->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson(
            "/api/v1/orders/{$order->id}/payment"
        );

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $payment->id);
    }

    public function test_admin_can_update_payment_status(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $order = Order::factory()->create();

        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson(
            "/api/v1/orders/{$order->id}/payment",
            [
                'status' => 'paid',
            ]
        );

        $response
            ->assertOk()
            ->assertJsonPath('data.status', 'paid');

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'paid',
        ]);
    }

    public function test_customer_cannot_update_payment_status(): void
    {
        $user = User::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
        ]);

        Payment::factory()->create([
            'order_id' => $order->id,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson(
            "/api/v1/orders/{$order->id}/payment",
            [
                'status' => 'paid',
            ]
        );

        $response->assertForbidden();
    }
}
