<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Services\Pricing;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * The sortable columns exposed by the catalog.
     *
     * @var array<string, array{label: string, column: string, direction: string}>
     */
    protected const SORTS = [
        'newest' => ['label' => 'Newest', 'column' => 'created_at', 'direction' => 'desc'],
        'price_asc' => ['label' => 'Price: low to high', 'column' => 'price_cents', 'direction' => 'asc'],
        'price_desc' => ['label' => 'Price: high to low', 'column' => 'price_cents', 'direction' => 'desc'],
        'name' => ['label' => 'Name: A–Z', 'column' => 'name', 'direction' => 'asc'],
    ];

    /**
     * List products with search, filtering, sorting and pagination.
     */
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'string', 'max:20'],
            'min_price' => ['nullable', 'numeric', 'min:0', 'max:100000'],
            'max_price' => ['nullable', 'numeric', 'min:0', 'max:100000'],
        ]);

        $sort = isset(self::SORTS[$validated['sort'] ?? ''])
            ? $validated['sort']
            : 'newest';

        $query = Product::query()->active()->with('category');

        if (! empty($validated['q'])) {
            $query->search($validated['q']);
        }

        if (! empty($validated['category'])) {
            $query->whereHas(
                'category',
                fn ($category) => $category->where('slug', $validated['category']),
            );
        }

        if (isset($validated['min_price']) && $validated['min_price'] !== '') {
            $query->where('price_cents', '>=', Pricing::toCents($validated['min_price']));
        }

        if (isset($validated['max_price']) && $validated['max_price'] !== '') {
            $query->where('price_cents', '<=', Pricing::toCents($validated['max_price']));
        }

        $products = $query
            ->orderBy(self::SORTS[$sort]['column'], self::SORTS[$sort]['direction'])
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        $activeCategory = ! empty($validated['category'])
            ? Category::query()->where('slug', $validated['category'])->first()
            : null;

        return Inertia::render('store/products', [
            'products' => $products,
            'categories' => Category::ordered()
                ->withCount([
                    'products as products_count' => fn ($query) => $query->where('is_active', true),
                ])
                ->get(),
            'activeCategory' => $activeCategory,
            'filters' => [
                'q' => $validated['q'] ?? '',
                'category' => $validated['category'] ?? '',
                'min_price' => $validated['min_price'] ?? '',
                'max_price' => $validated['max_price'] ?? '',
            ],
            'sort' => $sort,
            'sortOptions' => collect(self::SORTS)
                ->map(fn (array $definition, string $value): array => [
                    'value' => $value,
                    'label' => $definition['label'],
                ])
                ->values(),
        ]);
    }

    /**
     * Show a single product.
     */
    public function show(Request $request, Product $product): Response
    {
        abort_unless(
            $product->is_active || (bool) data_get($request->user(), 'is_admin', false),
            404,
        );

        $product->load('category');

        $related = Product::query()
            ->active()
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->with('category')
            ->inRandomOrder()
            ->limit(4)
            ->get();

        return Inertia::render('store/product', [
            'product' => $product,
            'related' => $related,
        ]);
    }
}
