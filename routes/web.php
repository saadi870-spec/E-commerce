<?php

use App\Http\Controllers\Store\HomeController;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function (Request $request) {
        $user = $request->user();

        return inertia('dashboard', [
            'stats' => [
                'orders' => Order::query()->where('user_id', $user->id)->count(),
                'open_orders' => Order::query()
                    ->where('user_id', $user->id)
                    ->whereIn('status', ['pending', 'paid', 'processing', 'shipped'])
                    ->count(),
                'spent_cents' => (int) Order::query()
                    ->where('user_id', $user->id)
                    ->whereNotIn('status', ['cancelled'])
                    ->sum('total_cents'),
            ],
            'recentOrders' => Order::query()
                ->where('user_id', $user->id)
                ->with('items')
                ->latest('placed_at')
                ->limit(5)
                ->get(),
        ]);
    })->name('dashboard');
});

require __DIR__.'/store.php';
require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
