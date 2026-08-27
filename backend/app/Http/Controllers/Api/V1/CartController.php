<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartItemResource;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Services\CartCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(
        private readonly CartCacheService $cartCache,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;

        $cachedCart = $this->cartCache->get($userId);

        if ($cachedCart !== null) {
            return response()->json([
                'data' => $cachedCart,
            ], 200);
        }

        $cart = Cart::firstOrCreate([
            'user_id' => $userId,
        ]);

        $cart->load(['items.product']);

        $response = (new CartResource($cart))
            ->resolve($request);

        $this->cartCache->put($userId, $response);

        return response()->json([
            'data' => $response,
        ], 200);
    }

    public function store(Request $request): JsonResponse|CartResource
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::findOrFail(
            $validated['product_id']
        );

        $userId = (int) $request->user()->id;

        $cart = Cart::firstOrCreate([
            'user_id' => $userId,
        ]);

        $cartItem = $cart->items()
            ->where('product_id', $product->id)
            ->first();

        $currentQuantity = $cartItem
            ? $cartItem->quantity
            : 0;

        $newTotalQuantity =
            $currentQuantity + $validated['quantity'];

        if ($newTotalQuantity > $product->stock) {
            return response()->json([
                'message' =>
                    'The requested quantity exceeds available stock.',
                'errors' => [
                    'quantity' => [
                        'The requested quantity exceeds available stock.',
                    ],
                ],
            ], 422);
        }

        if ($cartItem) {
            $cartItem->update([
                'quantity' => $newTotalQuantity,
            ]);
        } else {
            $cartItem = $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $validated['quantity'],
            ]);
        }

        /*
         * The cart has changed.
         * Never leave the old cart in Redis.
         */
        $this->cartCache->forget($userId);

        $cart->load(['items.product']);

        return (new CartResource($cart))
            ->response()
            ->setStatusCode(200);
    }

    public function update(
        Request $request,
        CartItem $cartItem
    ): JsonResponse|CartResource {
        if (
            $cartItem->cart->user_id !==
            $request->user()->id
        ) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $validated = $request->validate([
            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        if (
            $validated['quantity'] >
            $cartItem->product->stock
        ) {
            return response()->json([
                'message' =>
                    'The requested quantity exceeds available stock.',
                'errors' => [
                    'quantity' => [
                        'The requested quantity exceeds available stock.',
                    ],
                ],
            ], 422);
        }

        $cartItem->update([
            'quantity' => $validated['quantity'],
        ]);

        $userId = (int) $request->user()->id;

        $this->cartCache->forget($userId);

        $cart = $cartItem->cart->load([
            'items.product',
        ]);

        return new CartResource($cart);
    }

    public function destroy(
        Request $request,
        CartItem $cartItem
    ): JsonResponse {
        if (
            $cartItem->cart->user_id !==
            $request->user()->id
        ) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $userId = (int) $request->user()->id;

        $cartItem->delete();

        $this->cartCache->forget($userId);

        return response()->json([
            'message' => 'Item removed from cart.',
        ]);
    }
}
