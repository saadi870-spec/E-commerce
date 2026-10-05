<?php

namespace App\Models;

use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $number
 * @property int|null $user_id
 * @property string $status
 * @property string $email
 * @property string $name
 * @property string|null $phone
 * @property string $address_line1
 * @property string|null $address_line2
 * @property string $city
 * @property string $state
 * @property string $postal_code
 * @property string $country
 * @property string $payment_method
 * @property int $subtotal_cents
 * @property int $shipping_cents
 * @property int $tax_cents
 * @property int $total_cents
 * @property Carbon $placed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, OrderItem> $items
 * @property-read User|null $user
 */
#[Fillable([
    'number',
    'user_id',
    'status',
    'email',
    'name',
    'phone',
    'address_line1',
    'address_line2',
    'city',
    'state',
    'postal_code',
    'country',
    'payment_method',
    'subtotal_cents',
    'shipping_cents',
    'tax_cents',
    'total_cents',
    'placed_at',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    /**
     * The order statuses that never count towards revenue.
     *
     * @var list<string>
     */
    public const NON_REVENUE_STATUSES = ['cancelled'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal_cents' => 'integer',
            'shipping_cents' => 'integer',
            'tax_cents' => 'integer',
            'total_cents' => 'integer',
            'placed_at' => 'datetime',
        ];
    }

    /**
     * Orders are addressed by their human friendly order number.
     */
    public function getRouteKeyName(): string
    {
        return 'number';
    }

    /**
     * Get the line items for this order.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the customer account associated with the order, if any.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate a human friendly, unguessable order number.
     */
    public static function generateNumber(): string
    {
        $prefix = 'MER-'.now()->format('ym');

        do {
            $number = $prefix.'-'.Str::upper(Str::random(6));
        } while (static::query()->where('number', $number)->exists());

        return $number;
    }

    /**
     * Determine whether the order contributes to revenue.
     */
    public function countsTowardsRevenue(): bool
    {
        return ! in_array($this->status, self::NON_REVENUE_STATUSES, true);
    }

    /**
     * Get the human readable label for the order status.
     */
    public function statusLabel(): string
    {
        return config('shop.order_statuses.'.$this->status, ucfirst($this->status));
    }

    /**
     * Get the number of physical items in the order.
     */
    public function itemCount(): int
    {
        return (int) $this->items->sum('quantity');
    }
}
