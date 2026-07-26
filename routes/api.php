<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->name('api.v1.')
    ->group(function () {
        Route::get('/health', function () {
            return response()->json([
                'success' => true,
                'message' => 'API is healthy',
                'data' => [
                    'app' => config('app.name'),
                    'version' => 'v1',
                    'environment' => app()->environment(),
                    'timestamp' => now()->toIso8601String(),
                ],
            ]);
        });
    });