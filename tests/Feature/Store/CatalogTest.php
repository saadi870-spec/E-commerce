<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the home page renders with categories and products', function () {
    $category = Category::factory()->create(['position' => 1]);
    Product::factory()->create([
        'category_id' => $category->id,
        'is_featured' => true,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/home')
            ->has('categories', 1)
            ->where('categories.0.products_count', 1)
            ->has('featured', 1)
            ->has('latest', 1));
});

test('the catalog lists active products only', function () {
    $active = Product::factory()->create(['price_cents' => 5000]);
    Product::factory()->draft();

    $this->get(route('products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/products')
            ->has('products.data', 1)
            ->where('products.data.0.id', $active->id));
});

test('products can be filtered by category', function () {
    $apparel = Category::factory()->create(['slug' => 'apparel']);
    $home = Category::factory()->create(['slug' => 'home']);

    Product::factory()->create(['category_id' => $apparel->id]);
    Product::factory()->create(['category_id' => $home->id]);

    $this->get(route('products.index', ['category' => 'home']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/products')
            ->has('products.data', 1)
            ->where('activeCategory.slug', 'home'));
});

test('products can be searched', function () {
    Product::factory()->create(['name' => 'Wool Field Scarf', 'description' => 'Soft.']);
    Product::factory()->create(['name' => 'Leather Derby', 'description' => 'Shiny.']);

    $this->get(route('products.index', ['q' => 'wool']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/products')
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Wool Field Scarf'));
});

test('products can be sorted by price', function () {
    Product::factory()->create(['price_cents' => 9000]);
    Product::factory()->create(['price_cents' => 2000]);

    $this->get(route('products.index', ['sort' => 'price_asc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/products')
            ->where('products.data.0.price_cents', 2000));
});

test('a product page renders for visitors', function () {
    $product = Product::factory()->create();

    $this->get(route('products.show', $product->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/product')
            ->where('product.id', $product->id)
            ->has('related'));
});

test('draft products are hidden from visitors', function () {
    $product = Product::factory()->draft()->create();

    $this->get(route('products.show', $product->slug))->assertNotFound();
});

test('admins can preview draft products', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $product = Product::factory()->draft()->create();

    $this->actingAs($admin)
        ->get(route('products.show', $product->slug))
        ->assertOk();
});
