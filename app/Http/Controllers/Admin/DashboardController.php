<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Render the admin overview.
     */
    public function index(Request $request): Response
    {
        $now = Carbon::now();
        $lowStockThreshold = (int) config('shop.low_stock_threshold');

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'revenue_cents' => Order::query()
                    ->whereNotIn('status', Order::NON_REVENUE_STATUSES)
                    ->sum('total_cents'),
                'orders_count' => Order::query()->count(),
                'open_orders_count' => Order::query()
                    ->whereIn('status', ['pending', 'paid', 'processing', 'shipped'])
                    ->count(),
                'customers_count' => User::query()->count(),
                'products_count' => Product::query()->where('is_active', true)->count(),
                'low_stock_count' => Product::query()
                    ->where('is_active', true)
                    ->where('stock', '<=', $lowStockThreshold)
                    ->count(),
            ],
            'revenueSeries' => $this->revenueSeries($now),
            'recentOrders' => Order::query()
                ->with('items')
                ->latest('placed_at')
                ->limit(8)
                ->get(),
            'lowStockProducts' => Product::query()
                ->with('category')
                ->where('is_active', true)
                ->where('stock', '<=', $lowStockThreshold)
                ->orderBy('stock')
                ->limit(8)
                ->get(),
            'topProducts' => $this->topProducts(),
            'lowStockThreshold' => $lowStockThreshold,
        ]);
    }

    /**
     * Get the last 14 days of revenue, one bucket per day.
     *
     * @return list<array{date: string, total_cents: int}>
     */
    protected function revenueSeries(Carbon $now): array
    {
        $orders = Order::query()
            ->where('placed_at', '>=', $now->copy()->subDays(13)->startOfDay())
            ->whereNotIn('status', Order::NON_REVENUE_STATUSES)
            ->get(['placed_at', 'total_cents']);

        $byDay = $orders->groupBy(fn (Order $order): string => $order->placed_at->toDateString());

        $series = [];

        for ($daysAgo = 13; $daysAgo >= 0; $daysAgo--) {
            $date = $now->copy()->subDays($daysAgo);

            $series[] = [
                'date' => $date->toDateString(),
                'total_cents' => (int) ($byDay->get($date->toDateString())?->sum('total_cents') ?? 0),
            ];
        }

        return $series;
    }

    /**
     * Get the best selling products by units sold.
     *
     * @return array<int, array{product: array<string, mixed>|null, units: int}>
     */
    protected function topProducts(): array
    {
        $unitsByProduct = OrderItem::query()
            ->selectRaw('product_id, SUM(quantity) AS units')
            ->whereNotNull('product_id')
            ->groupBy('product_id')
            ->orderByDesc('units')
            ->limit(6)
            ->toBase()
            ->get();

        $products = Product::query()
            ->whereIn('id', $unitsByProduct->pluck('product_id'))
            ->get()
            ->keyBy('id');

        return collect($unitsByProduct)
            ->map(fn (object $row): ?array => $products->get((int) $row->product_id)?->only([
                'id',
                'name',
                'slug',
                'accent_color',
                'category',
            ]))
            ->filter()
            ->map(fn (array $product, int $index): array => [
                'product' => $product,
                'units' => (int) $unitsByProduct[$index]->units,
            ])
            ->values()
            ->all();
    }
}
