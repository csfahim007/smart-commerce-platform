<?php

namespace Tests\Feature\Api\V1;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use Cloudinary\Api\ApiResponse;
use Mockery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductImageApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_product_images(): void
    {
        $product = Product::factory()->create();

        ProductImage::factory()->count(2)->create([
            'product_id' => $product->id,
        ]);

        $response = $this->getJson("/api/v1/products/{$product->id}/images");

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_add_product_image(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $product = Product::factory()->create();

        $uploadApi = Mockery::mock(UploadApi::class);
        $uploadApi->shouldReceive('upload')
            ->once()
            ->andReturn(
                new ApiResponse(
                    [
                        'secure_url' => 'https://res.cloudinary.com/test/image/upload/product.jpg',
                        'public_id' => 'ai-ecommerce/products/' . $product->id . '/product',
                    ],
                    []
                )
            );
        $cloudinary = Mockery::mock(Cloudinary::class);
        $cloudinary->shouldReceive('uploadApi')
            ->once()
            ->andReturn($uploadApi);

        $this->app->instance(Cloudinary::class, $cloudinary);

        Sanctum::actingAs($admin);

        $image = UploadedFile::fake()->create('product.jpg', 100, 'image/jpeg');

        $response = $this->post(
            "/api/v1/products/{$product->id}/images",
            [
                'image' => $image,
                'is_primary' => true,
            ]
        );

        $response
            ->assertCreated()
            ->assertJsonPath(
                'data.image_url',
                'https://res.cloudinary.com/test/image/upload/product.jpg'
            )
            ->assertJsonPath('data.is_primary', true);

        $this->assertDatabaseHas('product_images', [
            'product_id' => $product->id,
            'image_url' => 'https://res.cloudinary.com/test/image/upload/product.jpg',
            'cloudinary_public_id' => 'ai-ecommerce/products/' . $product->id . '/product',
            'is_primary' => true,
        ]);
    }

    public function test_customer_cannot_add_product_image(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $product = Product::factory()->create();

        Sanctum::actingAs($customer);

        $response = $this->postJson(
            "/api/v1/products/{$product->id}/images",
            [
                'image_url' => 'https://example.com/product.jpg',
            ]
        );

        $response->assertForbidden();
    }

    public function test_guest_cannot_add_product_image(): void
    {
        $product = Product::factory()->create();

        $response = $this->postJson(
            "/api/v1/products/{$product->id}/images",
            [
                'image_url' => 'https://example.com/product.jpg',
            ]
        );

        $response->assertUnauthorized();
    }

    public function test_admin_can_delete_product_image(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $product = Product::factory()->create();

        $image = ProductImage::factory()->create([
            'product_id' => $product->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson(
            "/api/v1/products/{$product->id}/images/{$image->id}"
        );

        $response
            ->assertOk()
            ->assertJson([
                'message' => 'Product image deleted successfully.',
            ]);

        $this->assertDatabaseMissing('product_images', [
            'id' => $image->id,
        ]);
    }

    public function test_customer_cannot_delete_product_image(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $product = Product::factory()->create();

        $image = ProductImage::factory()->create([
            'product_id' => $product->id,
        ]);

        Sanctum::actingAs($customer);

        $response = $this->deleteJson(
            "/api/v1/products/{$product->id}/images/{$image->id}"
        );

        $response->assertForbidden();

        $this->assertDatabaseHas('product_images', [
            'id' => $image->id,
        ]);
    }

    public function test_deleting_product_deletes_its_images(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $product = Product::factory()->create();

        ProductImage::factory()->count(3)->create([
            'product_id' => $product->id,
        ]);

        Sanctum::actingAs($admin);

        $this->deleteJson("/api/v1/products/{$product->id}")
            ->assertOk();

        $this->assertDatabaseMissing('product_images', [
            'product_id' => $product->id,
        ]);
    }
}
