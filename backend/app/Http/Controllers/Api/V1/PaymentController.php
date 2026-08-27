<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function show(Request $request, Order $order): JsonResponse|PaymentResource
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $payment = $order->payment;

        if (! $payment) {
            return response()->json(['message' => 'Payment record not found.'], 404);
        }

        return new PaymentResource($payment);
    }

    public function update(Request $request, Order $order): JsonResponse|PaymentResource
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,paid,failed,refunded'],
            'transaction_id' => ['nullable', 'string', 'max:255'],
        ]);

        $payment = $order->payment;

        if (! $payment) {
            return response()->json(['message' => 'Payment record not found.'], 404);
        }

        $updateData = ['status' => $validated['status']];

        if (array_key_exists('transaction_id', $validated)) {
            $updateData['transaction_id'] = $validated['transaction_id'];
        }

        if ($validated['status'] === 'paid' && ! $payment->paid_at) {
            $updateData['paid_at'] = now();
        }

        $payment->update($updateData);

        return new PaymentResource($payment);
    }
}
