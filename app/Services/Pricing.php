<?php

namespace App\Services;

/**
 * Server-side pricing rules. All amounts are integer cents.
 */
class Pricing
{
    /**
     * Get the shipping charge for a given subtotal, in cents.
     */
    public static function shippingCents(int $subtotalCents): int
    {
        if ($subtotalCents < 1) {
            return 0;
        }

        $flat = (int) config('shop.shipping.flat_cents');
        $freeOver = (int) config('shop.shipping.free_over_cents');

        return $subtotalCents >= $freeOver ? 0 : $flat;
    }

    /**
     * Get the tax charged on a given subtotal, in cents.
     */
    public static function taxCents(int $subtotalCents): int
    {
        if ($subtotalCents < 1) {
            return 0;
        }

        return (int) round($subtotalCents * (float) config('shop.tax_rate'));
    }

    /**
     * Get the order total for a given subtotal, in cents.
     */
    public static function totalCents(int $subtotalCents): int
    {
        return $subtotalCents
            + self::shippingCents($subtotalCents)
            + self::taxCents($subtotalCents);
    }

    /**
     * Convert a dollar amount entered by a human into cents.
     */
    public static function toCents(float|string $amount): int
    {
        return (int) round(((float) $amount) * 100);
    }
}
