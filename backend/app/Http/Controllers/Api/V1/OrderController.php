<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = $request->user()
            ->orders()
            ->with(['items.product'])
            ->latest()
            ->paginate(15);

        return OrderResource::collection($orders);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_name' => ['nullable', 'string', 'max:255'],
            'shipping_phone' => ['nullable', 'string', 'max:255'],
            'shipping_address' => ['required', 'string'],
            'payment_method' => [
                'required',
                'string',
                'in:cash_on_delivery,stripe',
            ],
        ]);

        try {
            $order = $this->orderService->placeOrder(
                $request->user(),
                $validated
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        return (new OrderResource(
            $order->load(['items.product'])
        ))
            ->response()
            ->setStatusCode(201);
    }

    public function show(
        Request $request,
        \App\Models\Order $order
    ): JsonResponse|OrderResource {
        if ($order->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        return new OrderResource(
            $order->load(['items.product'])
        );
    }
}
