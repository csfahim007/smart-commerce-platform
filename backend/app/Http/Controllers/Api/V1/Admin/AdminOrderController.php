<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminOrderController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $orders = Order::with(['items.product', 'user'])
            ->latest()
            ->paginate(15);

        return OrderResource::collection($orders);
    }

    public function updateStatus(Request $request, Order $order): OrderResource
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,processing,shipped,delivered,cancelled'],
        ]);

        $order->update([
            'status' => $validated['status'],
        ]);

        return new OrderResource($order->load(['items.product', 'user']));
    }
}
