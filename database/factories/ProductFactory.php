<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $words = $this->faker->unique()->words(3, true);
        $name = ucfirst(is_string($words) ? $words : implode(' ', $words));
        $price = $this->faker->numberBetween(1900, 49900);
        $onSale = $this->faker->boolean(25);

        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower($this->faker->unique()->bothify('##??')),
            'sku' => 'SKU-'.strtoupper($this->faker->unique()->bothify('####??')),
            'tagline' => $this->faker->sentence(6),
            'description' => implode("\n\n", (array) $this->faker->paragraphs(3)),
            'specs' => [
                ['label' => 'Material', 'value' => $this->faker->randomElement(['Organic cotton', 'Full-grain leather', 'Recycled nylon', 'Brushed steel', 'Wool blend'])],
                ['label' => 'Warranty', 'value' => $this->faker->randomElement(['1 year', '2 years', '5 years'])],
            ],
            'price_cents' => $price,
            'compare_at_price_cents' => $onSale ? (int) round($price * 1.3) : null,
            'stock' => $this->faker->numberBetween(0, 60),
            'accent_color' => $this->faker->safeHexColor(),
            'is_featured' => $this->faker->boolean(30),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the product is out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn () => ['stock' => 0]);
    }

    /**
     * Indicate that the product is hidden from the storefront.
     */
    public function draft(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
