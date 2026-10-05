<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $words = $this->faker->unique()->words(2, true);
        $name = ucfirst(is_string($words) ? $words : implode(' ', $words));

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->sentence(),
            'position' => $this->faker->numberBetween(1, 20),
        ];
    }
}
