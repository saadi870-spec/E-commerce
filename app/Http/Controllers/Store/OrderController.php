<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * List the signed-in shopper's orders.
     */
    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('items')
            ->latest('placed_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('store/orders', [
            'orders' => $orders,
        ]);
    }

    /**
     * Show an order the shopper placed while signed in, checked out as a
     * guest in this session, or — for staff — any order at all.
     */
    public function show(Request $request, Order $order): Response
    {
        abort_unless($this->canView($request, $order), 404);

        $order->load(['items.product', 'user']);

        return Inertia::render('store/order', [
            'order' => $order,
            'canManage' => (bool) $request->user()?->is_admin,
        ]);
    }

    /**
     * Determine whether the current request may view the order.
     */
    protected function canView(Request $request, Order $order): bool
    {
        $user = $request->user();

        if ($user !== null && ($user->is_admin || $order->user_id === $user->id)) {
            return true;
        }

        $placed = $request->session()->get('orders.placed', []);

        return in_array($order->number, $placed, true);
    }
}
