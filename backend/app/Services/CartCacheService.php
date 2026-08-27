<?php

namespace App\Services;

use App\Models\Cart;
use Illuminate\Support\Facades\Cache;

class CartCacheService
{
    private const TTL = 300;

    public function key(int $userId): string
    {
        return "cart:user:{$userId}";
    }

    public function get(int $userId): ?array
    {
        return Cache::get($this->key($userId));
    }

    public function put(int $userId, array $cart): void
    {
        Cache::put(
            $this->key($userId),
            $cart,
            self::TTL
        );
    }

    public function forget(int $userId): void
    {
        Cache::forget($this->key($userId));
    }

    public function remember(int $userId, callable $callback): array
    {
        return Cache::remember(
            $this->key($userId),
            self::TTL,
            $callback
        );
    }
}
