<?php

use App\Models\Order;
use App\Models\User;

test('customers only see their own orders', function () {
    $customer = User::factory()->create();
    $other = User::factory()->create();

    Order::factory()->create(['user_id' => $customer->id]);
    Order::factory()->create(['user_id' => $other->id]);

    $this->actingAs($customer)
        ->get(route('orders.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('store/orders')
            ->has('orders.data', 1));
});

test('customers cannot open another customers order', function () {
    $customer = User::factory()->create();
    $other = User::factory()->create();
    $order = Order::factory()->create(['user_id' => $other->id]);

    $this->actingAs($customer)
        ->get(route('orders.show', $order))
        ->assertNotFound();
});

test('guests cannot open an order they did not place', function () {
    $order = Order::factory()->create();

    $this->get(route('orders.show', $order))->assertNotFound();
});

test('the orders index requires authentication', function () {
    $this->get(route('orders.index'))->assertRedirect(route('login'));
});
