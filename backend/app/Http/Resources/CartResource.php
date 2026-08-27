<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $total = $this->items->sum(function ($item) {
            return $item->quantity * ($item->product->price ?? 0);
        });

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'items' => CartItemResource::collection($this->items),
            'total' => number_format((float) $total, 2, '.', ''),
        ];
    }
}
