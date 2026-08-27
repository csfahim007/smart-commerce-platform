<?php

namespace Tests\Feature\Integrations;

use App\Events\OrderPlaced;
use App\Listeners\HandleOrderPlaced;
use App\Mail\OrderPlacedMail;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class HandleOrderPlacedTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_placed_listener_sends_email_and_notifies_n8n(): void
    {
        Mail::fake();
        Http::fake();

        config([
            'services.n8n.order_webhook_url' =>
                'https://n8n.cloudafk.xyz/webhook/order-placed',
        ]);

        $order = Order::factory()->create();

        app(HandleOrderPlaced::class)->handle(
            new OrderPlaced($order)
        );

        Mail::assertSent(OrderPlacedMail::class);

        Http::assertSent(function ($request) use ($order) {
            return $request->url() ===
                'https://n8n.cloudafk.xyz/webhook/order-placed'
                && $request['event'] === 'order.placed'
                && $request['order']['id'] === $order->id;
        });
    }
}
