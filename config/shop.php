<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Storefront
    |--------------------------------------------------------------------------
    |
    | Basic identity and commercial rules used across the storefront, the
    | checkout flow and the admin area. All monetary values are stored in
    | cents so that arithmetic never touches floating point numbers.
    |
    */

    'name' => env('SHOP_NAME', 'Meridian Supply Co.'),

    'currency' => env('SHOP_CURRENCY', 'USD'),

    // Applied to the subtotal only (8%).
    'tax_rate' => (float) env('SHOP_TAX_RATE', 0.08),

    'shipping' => [
        'flat_cents' => (int) env('SHOP_SHIPPING_FLAT', 800),
        'free_over_cents' => (int) env('SHOP_SHIPPING_FREE_OVER', 7500),
    ],

    // Products at or below this stock level are flagged in the admin area.
    'low_stock_threshold' => (int) env('SHOP_LOW_STOCK_THRESHOLD', 5),

    'checkout' => [
        'max_quantity_per_line' => 20,
    ],

    // Payment methods offered during checkout.
    'payment_methods' => [
        'card' => 'Credit or debit card',
        'cod' => 'Cash on delivery',
    ],

    'order_statuses' => [
        'pending' => 'Pending',
        'paid' => 'Paid',
        'processing' => 'Processing',
        'shipped' => 'Shipped',
        'delivered' => 'Delivered',
        'cancelled' => 'Cancelled',
    ],
];
