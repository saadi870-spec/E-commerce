<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function adminUser(): User
{
    return User::factory()->create(['is_admin' => true]);
}

function productPayload(array $overrides = []): array
{
    return [
        'name' => 'Heavyweight Oxford Shirt',
        'sku' => 'APPAREL-001',
        'category_id' => Category::factory()->create()->id,
        'description' => 'Garment-dyed cotton that softens with every wash.',
        'price' => '79.00',
        'stock' => 24,
        'is_active' => true,
        ...$overrides,
    ];
}

test('guests are redirected to login from the admin area', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('non-admins are forbidden from the admin area', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admins can view the store overview', function () {
    $this->actingAs(adminUser())
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->has('stats')
            ->has('revenueSeries', 14));
});

test('admins can create a product', function () {
    $this->actingAs(adminUser())
        ->post(route('admin.products.store'), productPayload())
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.products.index'));

    $product = Product::firstOrFail();

    expect($product->name)->toBe('Heavyweight Oxford Shirt')
        ->and($product->slug)->toBe('heavyweight-oxford-shirt')
        ->and($product->price_cents)->toBe(7900)
        ->and($product->is_active)->toBeTrue();
});

test('product input is validated', function () {
    $this->actingAs(adminUser())
        ->post(route('admin.products.store'), ['name' => ''])
        ->assertSessionHasErrors([
            'name',
            'sku',
            'category_id',
            'description',
            'price',
            'stock',
        ]);

    expect(Product::count())->toBe(0);
});

test('admins can update a product', function () {
    $admin = adminUser();
    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id]);

    $this->actingAs($admin)
        ->put(route('admin.products.update', $product), productPayload([
            'category_id' => $category->id,
            'name' => 'Updated Name',
            'price' => '24.50',
            'compare_at_price' => '30.00',
            'stock' => 7,
            'is_featured' => true,
            'is_active' => false,
            'specs' => [
                ['label' => 'Material', 'value' => 'Organic cotton'],
            ],
        ]))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.products.edit', $product));

    $product->refresh();

    expect($product->name)->toBe('Updated Name')
        ->and($product->price_cents)->toBe(2450)
        ->and($product->compare_at_price_cents)->toBe(3000)
        ->and($product->stock)->toBe(7)
        ->and($product->is_featured)->toBeTrue()
        ->and($product->is_active)->toBeFalse()
        ->and($product->specs)->toBe([
            ['label' => 'Material', 'value' => 'Organic cotton'],
        ]);
});

test('admins can delete a product', function () {
    $product = Product::factory()->create();

    $this->actingAs(adminUser())
        ->delete(route('admin.products.destroy', $product))
        ->assertRedirect(route('admin.products.index'));

    expect(Product::count())->toBe(0);
});

test('admins can list and filter orders', function () {
    Order::factory()->create(['status' => 'pending']);
    Order::factory()->create(['status' => 'delivered']);

    $this->actingAs(adminUser())
        ->get(route('admin.orders.index', ['status' => 'pending']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders')
            ->has('orders.data', 1));
});

test('cancelling an order returns stock and reopening reserves it again', function () {
    $product = Product::factory()->create(['stock' => 10]);
    $order = Order::factory()->create(['status' => 'paid']);

    $order->items()->create([
        'product_id' => $product->id,
        'name' => $product->name,
        'slug' => $product->slug,
        'price_cents' => $product->price_cents,
        'quantity' => 3,
    ]);

    $admin = adminUser();

    $this->actingAs($admin)
        ->patch(route('admin.orders.status', $order), ['status' => 'cancelled'])
        ->assertSessionHasNoErrors();

    expect($order->fresh()->status)->toBe('cancelled')
        ->and($product->fresh()->stock)->toBe(13);

    $this->actingAs($admin)
        ->patch(route('admin.orders.status', $order), ['status' => 'processing']);

    expect($product->fresh()->stock)->toBe(10);
});

test('order status changes are validated', function () {
    $order = Order::factory()->create();

    $this->actingAs(adminUser())
        ->patch(route('admin.orders.status', $order), ['status' => 'made-up'])
        ->assertSessionHasErrors('status');
});
