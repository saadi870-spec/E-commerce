<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\CheckoutRequest;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\Cart;
use App\Services\Pricing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(protected Cart $cart) {}

    /**
     * Show the checkout form.
     */
    public function create(Request $request): RedirectResponse|Response
    {
        if ($this->cart->isEmpty()) {
            Inertia::flash('toast', [
                'type' => 'info',
                'message' => 'Your cart is empty — add something before checking out.',
            ]);

            return to_route('cart.index');
        }

        $lines = $this->cart->lines();
        $subtotal = (int) $lines->sum('line_total_cents');

        /** @var User|null $user */
        $user = $request->user();

        return Inertia::render('store/checkout', [
            'lines' => $lines,
            'summary' => [
                'subtotal_cents' => $subtotal,
                'shipping_cents' => Pricing::shippingCents($subtotal),
                'tax_cents' => Pricing::taxCents($subtotal),
                'total_cents' => Pricing::totalCents($subtotal),
            ],
            'defaults' => [
                'name' => optional($user)->name ?? '',
                'email' => optional($user)->email ?? '',
            ],
            'old' => old(),
            'paymentMethods' => config('shop.payment_methods'),
        ]);
    }

    /**
     * Place the order: validate stock, create the order and empty the cart.
     */
    public function store(CheckoutRequest $request): RedirectResponse
    {
        if ($this->cart->isEmpty()) {
            Inertia::flash('toast', [
                'type' => 'info',
                'message' => 'Your cart is empty.',
            ]);

            return to_route('cart.index');
        }

        $validated = $request->validated();

        $order = DB::transaction(function () use ($validated, $request): Order {
            $lines = $this->cart->lines();

            $products = Product::query()
                ->whereIn('id', $lines->pluck('product.id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // Reconcile the cart against real stock before charging anyone.
            $shortage = null;

            foreach ($lines as $line) {
                $product = $products->get($line['product']->id);

                if ($product === null) {
                    $this->cart->remove($line['product']->id);
                    $shortage ??= $line['product'];

                    continue;
                }

                if ($product->stock < $line['quantity']) {
                    $this->cart->update($product, $product->stock);
                    $shortage ??= $product;
                }
            }

            if ($shortage !== null) {
                throw ValidationException::withMessages([
                    'cart' => $shortage->stock > 0
                        ? sprintf(
                            'Only %d × %s left in stock — your cart was updated to match.',
                            $shortage->stock,
                            $shortage->name,
                        )
                        : sprintf(
                            '%s is out of stock and was removed from your cart.',
                            $shortage->name,
                        ),
                ]);
            }

            $subtotal = (int) $lines->sum('line_total_cents');
            $shipping = Pricing::shippingCents($subtotal);
            $tax = Pricing::taxCents($subtotal);

            $order = Order::create([
                'number' => Order::generateNumber(),
                'user_id' => $request->user()?->id,
                'status' => $validated['payment_method'] === 'card' ? 'paid' : 'pending',
                'email' => $validated['email'],
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? null,
                'address_line1' => $validated['address_line1'],
                'address_line2' => $validated['address_line2'] ?? null,
                'city' => $validated['city'],
                'state' => $validated['state'],
                'postal_code' => $validated['postal_code'],
                'country' => strtoupper($validated['country']),
                'payment_method' => $validated['payment_method'],
                'subtotal_cents' => $subtotal,
                'shipping_cents' => $shipping,
                'tax_cents' => $tax,
                'total_cents' => $subtotal + $shipping + $tax,
                'placed_at' => now(),
            ]);

            foreach ($lines as $line) {
                $product = $products->get($line['product']->id);

                $order->items()->create([
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price_cents' => $product->price_cents,
                    'quantity' => $line['quantity'],
                ]);

                $product->decrement('stock', $line['quantity']);
            }

            return $order;
        });

        $this->cart->clear();
        $this->rememberPlacedOrder($request, $order);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => sprintf('Order %s confirmed — thank you!', $order->number),
        ]);

        return to_route('orders.show', $order);
    }

    /**
     * Remember the order number in the session so guests can view their
     * confirmation page (and returning customers can find it after login).
     */
    protected function rememberPlacedOrder(Request $request, Order $order): void
    {
        $placed = $request->session()->get('orders.placed', []);
        $placed[] = $order->number;

        $request->session()->put('orders.placed', array_slice($placed, -10));
    }
}
