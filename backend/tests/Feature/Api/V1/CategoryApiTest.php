<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_categories(): void
    {
        Category::factory()->create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'is_active' => true,
        ]);

        Category::factory()->create([
            'name' => 'Inactive Category',
            'slug' => 'inactive-category',
            'is_active' => false,
        ]);

        $response = $this->getJson('/api/v1/categories');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'description',
                        'is_active',
                        'sort_order',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'links',
                'meta',
            ]);

        $this->assertCount(2, $response->json('data'));
    }

    public function test_guest_can_view_category(): void
    {
        $category = Category::factory()->create([
            'name' => 'Electronics',
            'slug' => 'electronics',
        ]);

        $response = $this->getJson("/api/v1/categories/{$category->id}");

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $category->id)
            ->assertJsonPath('data.name', 'Electronics')
            ->assertJsonPath('data.slug', 'electronics');
    }

    public function test_missing_category_returns_not_found(): void
    {
        $this->getJson('/api/v1/categories/999999')
            ->assertNotFound();
    }

    public function test_admin_can_create_category(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/categories', [
            'name' => 'Electronics',
            'slug' => 'electronics',
            'description' => 'Electronic products',
            'is_active' => true,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Electronics')
            ->assertJsonPath('data.slug', 'electronics');

        $this->assertDatabaseHas('categories', [
            'name' => 'Electronics',
            'slug' => 'electronics',
        ]);
    }

    public function test_customer_cannot_create_category(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        Sanctum::actingAs($customer);

        $this->postJson('/api/v1/categories', [
            'name' => 'Electronics',
            'slug' => 'electronics',
            'description' => 'Electronic products',
            'is_active' => true,
        ])->assertForbidden();
    }

    public function test_guest_cannot_create_category(): void
    {
        $this->postJson('/api/v1/categories', [
            'name' => 'Electronics',
            'slug' => 'electronics',
            'description' => 'Electronic products',
            'is_active' => true,
        ])->assertUnauthorized();
    }

    public function test_admin_can_update_category(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $category = Category::factory()->create([
            'name' => 'Old Name',
            'slug' => 'old-name',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/v1/categories/{$category->id}", [
            'name' => 'New Name',
            'slug' => 'new-name',
            'description' => 'Updated description',
            'is_active' => true,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.slug', 'new-name');

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'New Name',
            'slug' => 'new-name',
        ]);
    }

    public function test_customer_cannot_update_category(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $category = Category::factory()->create();

        Sanctum::actingAs($customer);

        $this->putJson("/api/v1/categories/{$category->id}", [
            'name' => 'Updated Name',
            'slug' => 'updated-name',
            'description' => 'Updated description',
            'is_active' => true,
        ])->assertForbidden();
    }

    public function test_admin_can_delete_category(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $category = Category::factory()->create();

        Sanctum::actingAs($admin);

        $this->deleteJson("/api/v1/categories/{$category->id}")
            ->assertOk()
            ->assertJson([
                'message' => 'Category deleted successfully.',
            ]);

        $this->assertSoftDeleted('categories', [
            'id' => $category->id,
        ]);
    }

    public function test_customer_cannot_delete_category(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $category = Category::factory()->create();

        Sanctum::actingAs($customer);

        $this->deleteJson("/api/v1/categories/{$category->id}")
            ->assertForbidden();
    }
}