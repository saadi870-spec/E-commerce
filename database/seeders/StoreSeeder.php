<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class StoreSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the demo storefront: staff accounts, catalog and a few orders.
     */
    public function run(): void
    {
        $this->seedUsers();
        $categories = $this->seedCategories();
        $this->seedProducts($categories);
        $this->seedOrders();
    }

    /**
     * Create the demo shopper and store administrator.
     */
    protected function seedUsers(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        User::factory()->create([
            'name' => 'Ada Whitfield',
            'email' => 'admin@example.com',
            'is_admin' => true,
        ]);
    }

    /**
     * @return array<string, Category>
     */
    protected function seedCategories(): array
    {
        $definitions = [
            ['name' => 'Apparel', 'slug' => 'apparel', 'description' => 'Everyday layers cut from honest materials.'],
            ['name' => 'Footwear', 'slug' => 'footwear', 'description' => 'Shoes and boots built to be resoled, not replaced.'],
            ['name' => 'Bags', 'slug' => 'bags', 'description' => 'Carry goods that outlast the commute.'],
            ['name' => 'Accessories', 'slug' => 'accessories', 'description' => 'The small things, considered.'],
            ['name' => 'Home', 'slug' => 'home', 'description' => 'Quiet objects for calmer rooms.'],
        ];

        $categories = [];

        foreach ($definitions as $position => $definition) {
            $categories[$definition['slug']] = Category::create([
                ...$definition,
                'position' => $position + 1,
            ]);
        }

        return $categories;
    }

    /**
     * @param  array<string, Category>  $categories
     */
    protected function seedProducts(array $categories): void
    {
        $products = [
            'apparel' => [
                ['Heavyweight Oxford Shirt', 7900, 9900, 'Garment-dyed, 240gsm cotton that softens with every wash.', '#0f766e', 34],
                ['Merino Crew Sweater', 12800, null, 'Fine-gauge merino that regulates temperature without the itch.', '#374151', 21],
                ['Field Chore Jacket', 16800, 21000, 'Triple-stitched canvas with a corduroy collar and four pockets.', '#854d0e', 12],
                ['Relaxed Wool Trousers', 11800, null, 'Tapered wool blend with a hidden expandable waistband.', '#1e293b', 9],
                ['Boxy Cotton Tee', 3400, null, 'Heavy 260gsm jersey with a ribbed collar that holds its shape.', '#7c2d12', 60],
            ],
            'footwear' => [
                ['Trail Runner Low', 13500, 16500, 'Vibram outsole, recycled mesh upper, cushioned for long days.', '#166534', 28],
                ['Leather Derby', 19800, null, 'Goodyear-welted and resolable, made from vegetable-tanned hide.', '#3f3f46', 14],
                ['Canvas Court Sneaker', 8900, null, 'Organic canvas over a natural rubber sole. Simple on purpose.', '#b45309', 45],
                ['Insulated Work Boot', 22400, 26000, 'Waterproof membrane, 200g insulation, welted construction.', '#78350f', 7],
            ],
            'bags' => [
                ['Roll-Top Commuter Pack', 14800, null, '22L recycled nylon pack with a padded 16" laptop sleeve.', '#1d4ed8', 26],
                ['Waxed Duffel', 17500, 21000, '18oz waxed cotton with bridle leather handles.', '#713f12', 11],
                ['Everyday Tote', 6800, null, 'Structured canvas tote that stands up on its own.', '#065f46', 38],
                ['Sling Bag', 5400, null, 'Compact 3L sling with a magnetic quick-release buckle.', '#4c1d95', 3],
            ],
            'accessories' => [
                ['Merino Beanie', 3200, null, 'Ribbed, double-washed merino with a folded cuff.', '#9f1239', 52],
                ['Ridged Leather Belt', 5800, 7200, 'Full-grain leather, solid brass buckle, made to patina.', '#7f1d1d', 30],
                ['Acetate Sunglasses', 9500, null, 'Hand-polished acetate frames with polarized lenses.', '#0c4a6e', 17],
                ['Brushed Steel Watch', 24500, 29000, 'Sapphire crystal, 10 ATM, Swiss quartz movement.', '#334155', 6],
                ['Wool Field Scarf', 4600, null, 'Oversized lambswool scarf woven in a herringbone weave.', '#5b21b6', 24],
            ],
            'home' => [
                ['Stoneware Mug Set', 4800, null, 'Set of four speckled mugs, glazed and fired at 1240°C.', '#a16207', 41],
                ['Linen Throw Blanket', 9800, 12500, 'Stonewashed Belgian linen, 130 × 180 cm.', '#7c3aed', 15],
                ['Oak Desk Tray', 4200, null, 'Solid white oak tray with hand-felted base.', '#92400e', 19],
                ['Ribbed Glass Carafe', 3600, null, 'Mouth-blown carafe, 1L, dishwasher safe.', '#0e7490', 33],
                ['Ceramic Table Lamp', 15600, 18900, 'Matte ceramic base with a linen drum shade.', '#0f766e', 5],
            ],
        ];

        foreach ($products as $slug => $items) {
            $category = $categories[$slug];

            foreach ($items as $index => [$name, $price, $compareAt, $description, $accent, $stock]) {
                Product::create([
                    'category_id' => $category->id,
                    'name' => $name,
                    'slug' => Str::slug($name),
                    'sku' => strtoupper($slug.'-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT)),
                    'tagline' => Str::limit($description, 70, '…'),
                    'description' => $description."\n\n".
                        'Designed in-house and made in small batches by partners we visit every year. '.
                        'If anything fails within two years of normal use, we will repair or replace it — '.
                        'and we will repair it for life after that, at cost.',
                    'specs' => [
                        ['label' => 'Category', 'value' => ucfirst($slug)],
                        ['label' => 'SKU', 'value' => strtoupper($slug.'-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT))],
                        ['label' => 'Warranty', 'value' => '2 years, repairable for life'],
                    ],
                    'price_cents' => $price,
                    'compare_at_price_cents' => $compareAt,
                    'stock' => $stock,
                    'accent_color' => $accent,
                    'is_featured' => in_array($name, [
                        'Field Chore Jacket',
                        'Trail Runner Low',
                        'Roll-Top Commuter Pack',
                        'Linen Throw Blanket',
                        'Leather Derby',
                        'Ridged Leather Belt',
                        'Stoneware Mug Set',
                        'Merino Crew Sweater',
                    ], true),
                    'is_active' => true,
                ]);
            }
        }
    }

    /**
     * Create a handful of historical orders so the admin area has data.
     */
    protected function seedOrders(): void
    {
        $shopper = User::query()->where('email', 'test@example.com')->first();
        $products = Product::query()->where('is_active', true)->get();

        if ($products->count() < 3) {
            return;
        }

        $statuses = ['delivered', 'shipped', 'processing', 'paid', 'pending'];

        foreach ($statuses as $index => $status) {
            $lines = $products->random(min(3, $products->count()));

            $subtotal = 0;
            $items = [];

            foreach ($lines as $product) {
                $quantity = rand(1, 3);
                $subtotal += $product->price_cents * $quantity;
                $items[] = [$product, $quantity];
            }

            $shipping = $subtotal >= 7500 ? 0 : 800;
            $tax = (int) round($subtotal * 0.08);

            $order = Order::create([
                'number' => Order::generateNumber(),
                'user_id' => $index % 2 === 0 ? $shopper?->id : null,
                'status' => $status,
                'email' => $index % 2 === 0 ? $shopper?->email : 'guest@example.com',
                'name' => $index % 2 === 0 ? $shopper?->name : 'Jordan Reyes',
                'phone' => '+1 555 010 2233',
                'address_line1' => (string) fake()->streetAddress(),
                'address_line2' => null,
                'city' => (string) fake()->city(),
                'state' => (string) fake()->randomElement(['CA', 'NY', 'OR', 'TX', 'WA', 'IL', 'MA', 'CO']),
                'postal_code' => (string) fake()->postcode(),
                'country' => 'US',
                'payment_method' => $index % 2 === 0 ? 'card' : 'cod',
                'subtotal_cents' => $subtotal,
                'shipping_cents' => $shipping,
                'tax_cents' => $tax,
                'total_cents' => $subtotal + $shipping + $tax,
                'placed_at' => now()->subDays(13 - $index)->subHours(rand(0, 8)),
            ]);

            foreach ($items as [$product, $quantity]) {
                $order->items()->create([
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price_cents' => $product->price_cents,
                    'quantity' => $quantity,
                ]);
            }
        }

        Cache::forget('shop.categories');
    }
}
