<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ProductImageController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderController;
use App\Http\Controllers\Api\V1\ProductAssistantController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\StripePaymentController;
use App\Http\Controllers\Api\V1\StripeWebhookController; // <-- 1. ADDED IMPORT HERE

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

// Public Routes
Route::get('categories', [CategoryController::class, 'index'])
    ->name('categories.index');

Route::get('categories/{category}', [CategoryController::class, 'show'])
    ->name('categories.show');

Route::get('products', [ProductController::class, 'index'])
    ->name('products.index');

Route::get('products/{product}', [ProductController::class, 'show'])
    ->name('products.show');

Route::get('products/{product}/images', [ProductImageController::class, 'index'])
    ->name('products.images.index');

// Stripe Webhook (Must be public so Stripe servers can reach it)
Route::post('stripe/webhook', [StripeWebhookController::class, 'handle']) // <-- 2. ADDED ROUTE HERE
    ->name('stripe.webhook');

// Authenticated Customer & Admin Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('cart', [CartController::class, 'index'])
        ->name('cart.index');

    Route::post('cart/items', [CartController::class, 'store'])
        ->name('cart.items.store');

    Route::put('cart/items/{cartItem}', [CartController::class, 'update'])
        ->name('cart.items.update');

    Route::delete('cart/items/{cartItem}', [CartController::class, 'destroy'])
        ->name('cart.items.destroy');

    // AI
    Route::post('ai/product-assistant', ProductAssistantController::class)
        ->name('ai.product-assistant');

    // Order Routes
    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');

    Route::get('orders/{order}/payment', [PaymentController::class, 'show'])->name('orders.payment.show');

    // Stripe Payment Intent Route
    Route::post('orders/{order}/payment/intent', [StripePaymentController::class, 'createIntent'])
        ->name('orders.payment.intent');
});


// Admin-Only Routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('categories', [CategoryController::class, 'store'])
        ->name('categories.store');

    Route::put('categories/{category}', [CategoryController::class, 'update'])
        ->name('categories.update');

    Route::patch('categories/{category}', [CategoryController::class, 'update'])
        ->name('categories.update.patch');

    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])
        ->name('categories.destroy');

    Route::post('products', [ProductController::class, 'store'])
        ->name('products.store');

    Route::put('products/{product}', [ProductController::class, 'update'])
        ->name('products.update');

    Route::patch('products/{product}', [ProductController::class, 'update'])
        ->name('products.update.patch');

    Route::delete('products/{product}', [ProductController::class, 'destroy'])
        ->name('products.destroy');

    Route::post('products/{product}/images', [ProductImageController::class, 'store'])
        ->name('products.images.store');

    Route::delete('products/{product}/images/{image}', [ProductImageController::class, 'destroy'])
        ->name('products.images.destroy');

    Route::put('orders/{order}/payment', [PaymentController::class, 'update'])->name('orders.payment.update');
    Route::patch('orders/{order}/payment', [PaymentController::class, 'update'])->name('orders.payment.patch');

    Route::get('admin/orders', [AdminOrderController::class, 'index'])
        ->name('admin.orders.index');

    Route::put('admin/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])
        ->name('admin.orders.status.update');

    Route::patch('admin/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])
        ->name('admin.orders.status.patch');
});

// Auth Routes
Route::prefix('auth')
    ->name('api.v1.auth.')
    ->group(function () {
        Route::post('/register', [AuthController::class, 'register'])
            ->name('register');

        Route::post('/login', [AuthController::class, 'login'])
            ->name('login');

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me'])
                ->name('me');

            Route::post('/logout', [AuthController::class, 'logout'])
                ->name('logout');
        });
    });