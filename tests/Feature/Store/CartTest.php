<?php

use App\Models\Product;
use Inertia\Testing\AssertableInertia as Assert;

test('shoppers can add products to the cart', function () {
    $product = Product::factory()->create(['stock' => 10, 'price_cents' => 2500]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 2,
    ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->get(route('cart.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/cart')
            ->has('lines', 1)
            ->where('lines.0.quantity', 2)
            ->where('lines.0.line_total_cents', 5000)
            ->where('summary.subtotal_cents', 5000));
});

test('adding to the cart is clamped to available stock', function () {
    $product = Product::factory()->create(['stock' => 3]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $this->get(route('cart.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('lines', 1)
            ->where('lines.0.quantity', 3));
});

test('out of stock products cannot be added to the cart', function () {
    $product = Product::factory()->outOfStock()->create();

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ])->assertSessionHasNoErrors();

    $this->get(route('cart.index'))
        ->assertInertia(fn (Assert $page) => $page->has('lines', 0));
});

test('the cart persists across requests for guests', function () {
    $product = Product::factory()->create(['stock' => 5]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $this->get(route('cart.index'))
        ->assertInertia(fn (Assert $page) => $page->has('lines', 1));
});

test('quantities can be updated', function () {
    $product = Product::factory()->create(['stock' => 8]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $this->patch(route('cart.update', $product), ['quantity' => 4])
        ->assertSessionHasNoErrors();

    $this->get(route('cart.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('lines', 1)
            ->where('lines.0.quantity', 4));
});

test('setting the quantity to zero removes the line', function () {
    $product = Product::factory()->create(['stock' => 8]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $this->patch(route('cart.update', $product), ['quantity' => 0]);

    $this->get(route('cart.index'))
        ->assertInertia(fn (Assert $page) => $page->has('lines', 0));
});

test('lines can be removed from the cart', function () {
    $product = Product::factory()->create(['stock' => 8]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $this->delete(route('cart.destroy', $product))->assertRedirect();

    $this->get(route('cart.index'))
        ->assertInertia(fn (Assert $page) => $page->has('lines', 0));
});

test('inactive products are pruned from the cart', function () {
    $product = Product::factory()->create(['stock' => 8]);

    $this->post(route('cart.store'), [
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $product->update(['is_active' => false]);

    $this->get(route('cart.index'))
        ->assertInertia(fn (Assert $page) => $page->has('lines', 0));
});
