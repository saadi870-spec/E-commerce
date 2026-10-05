<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * List orders with optional status and search filters.
     */
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'max:20'],
        ]);

        $query = Order::query()->with('items')->latest('placed_at');

        if (! empty($validated['q'])) {
            $like = '%'.$validated['q'].'%';
            $query->where(function ($nested) use ($like) {
                $nested->where('number', 'like', $like)
                    ->orWhere('name', 'like', $like)
                    ->orWhere('email', 'like', $like);
            });
        }

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        return Inertia::render('admin/orders', [
            'orders' => $query->paginate(15)->withQueryString(),
            'filters' => [
                'q' => $validated['q'] ?? '',
                'status' => $validated['status'] ?? '',
            ],
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    /**
     * Show a single order with its line items.
     */
    public function show(Order $order): Response
    {
        return Inertia::render('admin/orders/show', [
            'order' => $order->load(['items.product', 'user']),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    /**
     * Update an order's fulfillment status, restocking products when an
     * order is cancelled and reserving stock again when it is reopened.
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(array_keys(config('shop.order_statuses')))],
        ]);

        $status = $validated['status'];

        if ($status !== $order->status) {
            DB::transaction(function () use ($order, $status): void {
                $this->syncStock($order, $status);

                $order->update(['status' => $status]);
            });

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => sprintf('Order %s marked as %s.', $order->number, config('shop.order_statuses.'.$status)),
            ]);
        }

        return to_route('admin.orders.show', $order);
    }

    /**
     * Adjust product stock to reflect a status transition.
     */
    protected function syncStock(Order $order, string $newStatus): void
    {
        $wasCancelled = $order->status === 'cancelled';
        $nowCancelled = $newStatus === 'cancelled';

        if ($wasCancelled === $nowCancelled) {
            return;
        }

        $direction = $wasCancelled ? 'decrement' : 'increment';

        foreach ($order->items as $item) {
            if ($item->product_id === null) {
                continue;
            }

            if ($direction === 'increment') {
                Product::query()->whereKey($item->product_id)->increment('stock', $item->quantity);
            } else {
                Product::query()->whereKey($item->product_id)->decrement('stock', $item->quantity);
            }
        }
    }

    /**
     * Get the order status filter/label options.
     *
     * @return array<int, array{value: string, label: string}>
     */
    protected function statusOptions(): array
    {
        $statuses = config('shop.order_statuses');

        return collect([
            '' => 'All orders',
            ...$statuses,
        ])
            ->map(fn (string $label, string $value): array => [
                'value' => $value,
                'label' => $label,
            ])
            ->values()
            ->all();
    }
}
