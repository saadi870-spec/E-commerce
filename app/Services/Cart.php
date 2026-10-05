<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * Session-backed shopping cart.
 *
 * Quantities are stored as a simple [product id => quantity] map so the cart
 * survives for guests and for authenticated shoppers alike. Every read goes
 * through the products table, which means stale or deactivated lines are
 * pruned automatically as the shopper browses.
 */
class Cart
{
    protected const SESSION_KEY = 'cart.items';

    public function __construct(protected Request $request) {}

    /**
     * Get the cart contents enriched with product data.
     *
     * @return Collection<int, array{product: Product, quantity: int, line_total_cents: int}>
     */
    public function lines(): Collection
    {
        $quantities = $this->quantities();

        if ($quantities === []) {
            return collect();
        }

        $products = Product::query()
            ->with('category')
            ->whereIn('id', array_keys($quantities))
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Prune lines whose product has been removed or deactivated.
        $retained = $products
            ->mapWithKeys(fn (Product $product): array => [$product->id => $quantities[$product->id]]);

        if (count($retained) !== count($quantities)) {
            $this->putQuantities($retained->all());
        }

        return $products
            ->map(fn (Product $product): array => [
                'product' => $product,
                'quantity' => $quantities[$product->id],
                'line_total_cents' => $product->price_cents * $quantities[$product->id],
            ])
            ->values();
    }

    /**
     * Add a product to the cart, clamped to the purchasable stock.
     *
     * @return int the quantity now in the cart
     */
    public function add(Product $product, int $quantity = 1): int
    {
        $quantities = $this->quantities();
        $current = $quantities[$product->id] ?? 0;
        $maximum = $product->purchasableQuantity();

        $next = min($current + max(1, $quantity), $maximum);

        if ($next < 1) {
            return $current;
        }

        $quantities[$product->id] = $next;
        $this->putQuantities($quantities);

        return $next;
    }

    /**
     * Set the quantity for a product. A quantity of zero removes the line.
     *
     * @return int the quantity now in the cart
     */
    public function update(Product $product, int $quantity): int
    {
        $quantities = $this->quantities();

        if ($quantity < 1) {
            unset($quantities[$product->id]);
            $this->putQuantities($quantities);

            return 0;
        }

        $clamped = min($quantity, $product->purchasableQuantity());

        if ($clamped < 1) {
            return $this->update($product, 0);
        }

        $quantities[$product->id] = $clamped;
        $this->putQuantities($quantities);

        return $clamped;
    }

    /**
     * Remove a product from the cart.
     */
    public function remove(int $productId): void
    {
        $quantities = $this->quantities();
        unset($quantities[$productId]);
        $this->putQuantities($quantities);
    }

    /**
     * Empty the cart.
     */
    public function clear(): void
    {
        $this->request->session()->forget(self::SESSION_KEY);
    }

    /**
     * Get the total number of items in the cart.
     */
    public function count(): int
    {
        return (int) $this->lines()->sum('quantity');
    }

    /**
     * Get the cart subtotal, in cents.
     */
    public function subtotalCents(): int
    {
        return (int) $this->lines()->sum('line_total_cents');
    }

    /**
     * Determine whether the cart has no purchasable lines.
     */
    public function isEmpty(): bool
    {
        return $this->lines()->isEmpty();
    }

    /**
     * Get the lightweight summary shared with every Inertia response.
     *
     * @return array{count: int, subtotal_cents: int}
     */
    public function summary(): array
    {
        $lines = $this->lines();

        return [
            'count' => (int) $lines->sum('quantity'),
            'subtotal_cents' => (int) $lines->sum('line_total_cents'),
        ];
    }

    /**
     * Get the raw quantity map from the session.
     *
     * @return array<int, int>
     */
    protected function quantities(): array
    {
        $quantities = $this->request->session()->get(self::SESSION_KEY, []);

        if (! is_array($quantities)) {
            return [];
        }

        return array_filter(
            array_map('intval', $quantities),
            fn (int $quantity): bool => $quantity > 0,
        );
    }

    /**
     * Persist the quantity map back to the session.
     *
     * @param  array<int, int>  $quantities
     */
    protected function putQuantities(array $quantities): void
    {
        if ($quantities === []) {
            $this->request->session()->forget(self::SESSION_KEY);

            return;
        }

        $this->request->session()->put(self::SESSION_KEY, $quantities);
    }
}
