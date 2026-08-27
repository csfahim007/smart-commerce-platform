<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductImageResource;
use App\Models\Product;
use App\Models\ProductImage;
use Cloudinary\Cloudinary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductImageController extends Controller
{
    public function index(Product $product): AnonymousResourceCollection
    {
        return ProductImageResource::collection(
            $product->images()->latest()->get()
        );
    }

    public function store(
        Request $request,
        Product $product,
        Cloudinary $cloudinary
    ): JsonResponse {
        $validated = $request->validate([
            'image' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
            'is_primary' => [
                'nullable',
                'boolean',
            ],
        ]);

        $isPrimary = $validated['is_primary'] ?? false;

        /*
         * If this is the first image, automatically make it primary.
         */
        if ($product->images()->count() === 0) {
            $isPrimary = true;
        }

        /*
         * If this image is primary, remove primary
         * status from the existing images.
         */
        if ($isPrimary) {
            $product->images()->update([
                'is_primary' => false,
            ]);
        }

        /*
         * Upload directly to Cloudinary.
         */
        $upload = $cloudinary
            ->uploadApi()
            ->upload(
                $request->file('image')->getRealPath(),
                [
                    'folder' => 'ai-ecommerce/products/' . $product->id,
                    'resource_type' => 'image',
                ]
            );

        // 🌟 SYNCHRONIZED: Changed 'public_id' to 'cloudinary_public_id'
        $image = $product->images()->create([
            'image_url' => $upload['secure_url'],
            'cloudinary_public_id' => $upload['public_id'],
            'is_primary' => $isPrimary,
        ]);

        return (new ProductImageResource($image))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(
        Product $product,
        ProductImage $image,
        Cloudinary $cloudinary
    ): JsonResponse {
        /*
         * Make sure this image actually belongs
         * to the product in the URL.
         */
        if ($image->product_id !== $product->id) {
            return response()->json([
                'message' => 'Image does not belong to this product.',
            ], 404);
        }

        /*
         * Delete the Cloudinary asset.
         * 🌟 SYNCHRONIZED: Changed 'public_id' to 'cloudinary_public_id'
         */
        if ($image->cloudinary_public_id) {
            $cloudinary
                ->uploadApi()
                ->destroy($image->cloudinary_public_id);
        }

        /*
         * Delete the database record.
         */
        $wasPrimary = $image->is_primary;

        $image->delete();

        /*
         * If the deleted image was primary,
         * promote another image.
         */
        if ($wasPrimary) {
            $replacement = $product->images()
                ->latest('id')
                ->first();

            if ($replacement) {
                $replacement->update([
                    'is_primary' => true,
                ]);
            }
        }

        return response()->json([
            'message' => 'Product image deleted successfully.',
        ]);
    }
}
