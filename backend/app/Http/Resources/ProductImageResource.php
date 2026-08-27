<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
      return [
        'id' => $this->id,
        'product_id' => $this->product_id,
        'image_url' => $this->image_url,
        'cloudinary_public_id' => $this->cloudinary_public_id,
        'is_primary' => (bool) $this->is_primary,
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
];
    }
}
