<?php

namespace Tests\Feature\Integrations;

use App\Models\Order;
use App\Services\Integrations\N8nService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class N8nServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_sends_order_placed_webhook_to_n8n_with_secret_header(): void
    {
        Http::fake();

        config([
            'services.n8n.order_webhook_url' => 'https://n8n.cloudafk.xyz/webhook/order-placed',
            'services.n8n.webhook_secret' => 'test-secret-12345',
        ]);

        $order = Order::factory()->create([
            'status' => 'pending',
            'total' => 1500.00,
        ]);

        app(N8nService::class)->orderPlaced($order);

        Http::assertSent(function ($request) use ($order) {
            return $request->url() === 'https://n8n.cloudafk.xyz/webhook/order-placed'
                && $request->hasHeader('X-N8N-Webhook-Secret', 'test-secret-12345')
                && $request['event'] === 'order.placed'
                && $request['order']['id'] === $order->id;
        });
    }

    public function test_skips_webhook_if_url_not_configured(): void
    {
        Http::fake();

        config(['services.n8n.order_webhook_url' => null]);

        $order = Order::factory()->create();

        app(N8nService::class)->orderPlaced($order);

        Http::assertNothingSent();
    }
}
