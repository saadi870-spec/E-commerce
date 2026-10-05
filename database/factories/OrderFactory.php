<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->numberBetween(2500, 40000);
        $shipping = $subtotal >= 7500 ? 0 : 800;
        $tax = (int) round($subtotal * 0.08);

        return [
            'number' => Order::generateNumber(),
            'user_id' => User::factory(),
            'status' => $this->faker->randomElement(['pending', 'paid', 'processing', 'shipped', 'delivered']),
            'email' => $this->faker->safeEmail(),
            'name' => $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'address_line1' => $this->faker->streetAddress(),
            'address_line2' => null,
            'city' => $this->faker->city(),
            'state' => $this->faker->randomElement(['CA', 'NY', 'OR', 'TX', 'WA', 'IL', 'MA', 'CO']),
            'postal_code' => $this->faker->postcode(),
            'country' => 'US',
            'payment_method' => $this->faker->randomElement(['card', 'cod']),
            'subtotal_cents' => $subtotal,
            'shipping_cents' => $shipping,
            'tax_cents' => $tax,
            'total_cents' => $subtotal + $shipping + $tax,
            'placed_at' => Carbon::now()->subDays($this->faker->numberBetween(0, 60)),
        ];
    }

    /**
     * Indicate that the order was placed by a guest.
     */
    public function guest(): static
    {
        return $this->state(fn () => ['user_id' => null]);
    }

    /**
     * Indicate that the order has been cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn () => ['status' => 'cancelled']);
    }
}
