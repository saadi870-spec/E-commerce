<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\AddToCartRequest;
use App\Models\Product;
use App\Services\Cart;
use App\Services\Pricing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(protected Cart $cart) {}

    /**
     * Show the shopping cart.
     */
    public function index(): Response
    {
        return Inertia::render('store/cart', [
            'lines' => $this->cart->lines(),
            'summary' => $this->summary(),
        ]);
    }

    /**
     * Add a product to the cart.
     */
    public function store(AddToCartRequest $request): RedirectResponse
    {
        $product = Product::query()
            ->active()
            ->whereKey($request->validated('product_id'))
            ->firstOrFail();

        $before = $this->quantityFor($product);
        $after = $this->cart->add($product, (int) $request->validated('quantity'));

        if ($after > $before) {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => sprintf('%s added to your cart.', $product->name),
            ]);
        } else {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => sprintf(
                    'Only %d × %s in stock.',
                    $product->purchasableQuantity(),
                    $product->name,
                ),
            ]);
        }

        return back();
    }

    /**
     * Update the quantity of a line in the cart. Zero removes the line.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:0', 'max:1000'],
        ]);

        $productId = (int) $request->route('product');
        $product = Product::find($productId);

        if ($product === null) {
            $this->cart->remove($productId);

            return back();
        }

        $requested = (int) $validated['quantity'];
        $stored = $this->cart->update($product, $requested);

        if ($requested > 0 && $stored === 0) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => sprintf(
                    '%s is out of stock and was removed from your cart.',
                    $product->name,
                ),
            ]);
        } elseif ($requested > $stored) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => sprintf(
                    'Quantity capped at %d — that is all the stock we have.',
                    $stored,
                ),
            ]);
        }

        return back();
    }

    /**
     * Remove a line from the cart.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $productId = (int) $request->route('product');
        $product = Product::find($productId);

        $this->cart->remove($productId);

        Inertia::flash('toast', [
            'type' => 'info',
            'message' => $product !== null
                ? sprintf('%s removed from your cart.', $product->name)
                : 'Item removed from your cart.',
        ]);

        return back();
    }

    /**
     * Get the cart totals for display.
     *
     * @return array{subtotal_cents: int, shipping_cents: int, tax_cents: int, total_cents: int}
     */
    protected function summary(): array
    {
        $subtotal = $this->cart->subtotalCents();

        return [
            'subtotal_cents' => $subtotal,
            'shipping_cents' => Pricing::shippingCents($subtotal),
            'tax_cents' => Pricing::taxCents($subtotal),
            'total_cents' => Pricing::totalCents($subtotal),
        ];
    }

    /**
     * Get the quantity of a product currently in the cart.
     */
    protected function quantityFor(Product $product): int
    {
        $line = $this->cart->lines()->first(
            fn (array $line): bool => $line['product']->is($product),
        );

        return $line['quantity'] ?? 0;
    }
}
