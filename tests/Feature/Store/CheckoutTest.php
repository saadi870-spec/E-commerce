<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function checkoutPayload(array $overrides = []): array
{
    return [
        'name' => 'Jordan Reyes',
        'email' => 'jordan@example.com',
        'phone' => '+1 555 010 0000',
        'address_line1' => '128 Maple Street',
        'address_line2' => null,
        'city' => 'Portland',
        'state' => 'OR',
        'postal_code' => '97204',
        'country' => 'US',
        'payment_method' => 'card',
        ...$overrides,
    ];
}

test('the checkout page shows the cart summary', function () {
    $product = Product::factory()->create(['stock' => 10, 'price_cents' => 3000]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $this->get(route('checkout.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/checkout')
            ->has('lines', 1)
            ->where('summary.subtotal_cents', 3000)
            ->where('summary.total_cents', 3000 + 800 + 240));
});

test('the checkout page redirects empty carts to the cart', function () {
    $this->get(route('checkout.create'))->assertRedirect(route('cart.index'));
});

test('guests can place an order', function () {
    $product = Product::factory()->create(['stock' => 10, 'price_cents' => 5000]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $response = $this->post(route('checkout.store'), checkoutPayload());

    $order = Order::firstOrFail();

    expect($order->user_id)->toBeNull()
        ->and($order->status)->toBe('paid')
        ->and($order->subtotal_cents)->toBe(10000)
        ->and($order->shipping_cents)->toBe(0)
        ->and($order->tax_cents)->toBe(800)
        ->and($order->total_cents)->toBe(10800)
        ->and($product->fresh()->stock)->toBe(8)
        ->and($order->number)->toMatch('/^MER-[0-9]{4}-[A-Z0-9]{6}$/');

    $response->assertRedirect(route('orders.show', $order));

    $this->get(route('orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/order')
            ->where('order.number', $order->number)
            ->has('order.items', 1));

    $this->get(route('cart.index'))
        ->assertInertia(fn (Assert $page) => $page->has('lines', 0));
});

test('cash on delivery orders stay pending', function () {
    $product = Product::factory()->create(['stock' => 5, 'price_cents' => 1200]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $this->post(route('checkout.store'), checkoutPayload([
        'payment_method' => 'cod',
    ]));

    expect(Order::firstOrFail()->status)->toBe('pending');
});

test('shipping is charged below the free shipping threshold', function () {
    $product = Product::factory()->create(['stock' => 5, 'price_cents' => 2000]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $this->post(route('checkout.store'), checkoutPayload());

    $order = Order::firstOrFail();

    expect($order->subtotal_cents)->toBe(2000)
        ->and($order->shipping_cents)->toBe(800)
        ->and($order->tax_cents)->toBe(160)
        ->and($order->total_cents)->toBe(2960);
});

test('checkout requires valid shipping details', function () {
    $product = Product::factory()->create(['stock' => 5]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $this->from(route('checkout.create'))
        ->post(route('checkout.store'), ['email' => 'not-an-email'])
        ->assertSessionHasErrors([
            'name',
            'email',
            'address_line1',
            'city',
            'state',
            'postal_code',
            'country',
            'payment_method',
        ]);

    expect(Order::count())->toBe(0)
        ->and($product->fresh()->stock)->toBe(5);
});

test('checkout is rejected when the cart is empty', function () {
    $this->post(route('checkout.store'), checkoutPayload())
        ->assertRedirect(route('cart.index'));

    expect(Order::count())->toBe(0);
});

test('stock shortages block checkout and repair the cart', function () {
    $product = Product::factory()->create(['stock' => 10, 'price_cents' => 4000]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 3,
    ]);

    $product->update(['stock' => 2]);

    $this->post(route('checkout.store'), checkoutPayload())
        ->assertSessionHasErrors('cart');

    expect(Order::count())->toBe(0)
        ->and($product->fresh()->stock)->toBe(2);

    $this->get(route('cart.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('lines', 1)
            ->where('lines.0.quantity', 2));
});

test('signed in shoppers attach their account to orders', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['stock' => 4, 'price_cents' => 1500]);

    $this->actingAs($user)
        ->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

    $this->actingAs($user)
        ->post(route('checkout.store'), checkoutPayload([
            'email' => $user->email,
        ]));

    expect(Order::firstOrFail()->user_id)->toBe($user->id);

    $this->actingAs($user)
        ->get(route('orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/orders')
            ->has('orders.data', 1));
});
