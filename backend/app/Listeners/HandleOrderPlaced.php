<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Mail\OrderPlacedMail;
use App\Services\Integrations\N8nService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class HandleOrderPlaced implements ShouldQueue
{
    public function __construct(
        private N8nService $n8nService
    ) {}

    public function handle(OrderPlaced $event): void
    {
        $order = $event->order->loadMissing('user');

        Mail::to($order->user->email)
            ->send(new OrderPlacedMail($order));

        $this->n8nService->orderPlaced($order);
    }
}