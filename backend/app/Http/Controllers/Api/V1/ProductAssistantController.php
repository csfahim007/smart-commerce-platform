<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AI\ProductAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProductAssistantController extends Controller
{
    public function __construct(
        private readonly ProductAssistantService $assistant
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        try {
            $result = $this->assistant->ask($validated['message']);

            return response()->json([
                'data' => $result,
            ]);
        } catch (Throwable $e) {
            Log::error('Product assistant failed.', [
                'message' => $validated['message'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'The product assistant is temporarily unavailable.',
            ], 503);
        }
    }
}