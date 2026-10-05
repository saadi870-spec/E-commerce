<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $category_id
 * @property string $name
 * @property string $slug
 * @property string $sku
 * @property string|null $tagline
 * @property string $description
 * @property array<int, array{label: string, value: string}>|null $specs
 * @property int $price_cents
 * @property int|null $compare_at_price_cents
 * @property int $stock
 * @property string $accent_color
 * @property bool $is_featured
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Category|null $category
 */
#[Fillable([
    'category_id',
    'name',
    'slug',
    'sku',
    'tagline',
    'description',
    'specs',
    'price_cents',
    'compare_at_price_cents',
    'stock',
    'accent_color',
    'is_featured',
    'is_active',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'specs' => 'array',
            'price_cents' => 'integer',
            'compare_at_price_cents' => 'integer',
            'stock' => 'integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the category the product belongs to.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Scope the query to products visible on the storefront.
     *
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope the query to featured products.
     *
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope the query to a free-text search term.
     *
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        $term = trim($term);

        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $nested) use ($term) {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $term).'%';

            $nested
                ->where('name', 'like', $like)
                ->orWhere('description', 'like', $like)
                ->orWhere('tagline', 'like', $like)
                ->orWhere('sku', 'like', $like)
                ->orWhereHas('category', fn (Builder $category) => $category->where('name', 'like', $like));
        });
    }

    /**
     * Determine whether the product is currently discounted.
     */
    public function isOnSale(): bool
    {
        return $this->compare_at_price_cents !== null
            && $this->compare_at_price_cents > $this->price_cents;
    }

    /**
     * Get the discount percentage when the product is on sale.
     */
    public function discountPercent(): ?int
    {
        if (! $this->isOnSale()) {
            return null;
        }

        return (int) round(
            (1 - ($this->price_cents / $this->compare_at_price_cents)) * 100
        );
    }

    /**
     * Determine whether the product can be purchased.
     */
    public function inStock(): bool
    {
        return $this->stock > 0;
    }

    /**
     * Get the maximum quantity a single shopper may add to their cart.
     */
    public function purchasableQuantity(): int
    {
        return min($this->stock, (int) config('shop.checkout.max_quantity_per_line'));
    }
}
