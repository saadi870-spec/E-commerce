<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Services\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'shop' => [
                'name' => config('shop.name'),
                'currency' => config('shop.currency'),
                'taxRate' => (float) config('shop.tax_rate'),
                'freeShippingOverCents' => (int) config('shop.shipping.free_over_cents'),
                'flatShippingCents' => (int) config('shop.shipping.flat_cents'),
                'paymentMethods' => config('shop.payment_methods'),
            ],
            'auth' => [
                'user' => $request->user(),
            ],
            'cart' => app(Cart::class)->summary(),
            'categories' => Cache::remember(
                'shop.categories',
                now()->addHour(),
                fn (): array => Category::ordered()
                    ->get(['id', 'name', 'slug', 'description', 'position'])
                    ->map(fn (Category $category): array => $category->toArray())
                    ->all(),
            ),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
