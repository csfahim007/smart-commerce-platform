<?php

namespace App\Services\Integrations;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class N8nService
{
    public function orderPlaced(Order $order): void
    {
        $webhookUrl = config('services.n8n.order_webhook_url');

        if (! $webhookUrl) {
            Log::warning('N8N webhook URL missing.', [
                'order_id' => $order->id,
            ]);

            return;
        }

       Log::info('N8N webhook START', [
        'order_id' => $order->id,
        'order_number' => $order->order_number,
        'user_id' => $order->user_id,
        'customer_name' => $order->user?->name,
        'customer_email' => $order->user?->email,
        'url' => $webhookUrl,
        ]);

        $response = Http::timeout(10)
            ->withHeaders(array_filter([
                'X-N8N-Webhook-Secret' => config('services.n8n.webhook_secret'),
            ]))
            ->post($webhookUrl, [
                'event' => 'order.placed',
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'user_id' => $order->user_id,
                    'status' => $order->status,
                    'total' => $order->total,
                ],
                'customer' => [
                    'name' => $order->user?->name,
                    'email' => $order->user?->email,
                ],
            ]);

        Log::info('N8N webhook RESPONSE', [
            'order_id' => $order->id,
            'status' => $response->status(),
            'successful' => $response->successful(),
        ]);

        $response->throw();
    }
}
