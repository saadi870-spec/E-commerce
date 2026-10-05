<?php

use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\OrderController;
use App\Http\Controllers\Store\ProductController;
use Illuminate\Support\Facades\Route;

// Catalog ---------------------------------------------------------------

Route::get('products', [ProductController::class, 'index'])->name('products.index');
Route::get('products/{product:slug}', [ProductController::class, 'show'])->name('products.show');

// Cart ------------------------------------------------------------------

Route::get('cart', [CartController::class, 'index'])->name('cart.index');
Route::post('cart', [CartController::class, 'store'])->name('cart.store');
Route::patch('cart/{product}', [CartController::class, 'update'])->name('cart.update');
Route::delete('cart/{product}', [CartController::class, 'destroy'])->name('cart.destroy');

// Checkout --------------------------------------------------------------

Route::get('checkout', [CheckoutController::class, 'create'])->name('checkout.create');
Route::post('checkout', [CheckoutController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('checkout.store');

// Orders ----------------------------------------------------------------

Route::get('orders', [OrderController::class, 'index'])
    ->middleware('auth')
    ->name('orders.index');
Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
