<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * List every product in the catalog.
     */
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:active,draft,low_stock'],
        ]);

        $query = Product::query()->with('category')->latest();

        if (! empty($validated['q'])) {
            $query->search($validated['q']);
        }

        match ($validated['status'] ?? '') {
            'active' => $query->where('is_active', true),
            'draft' => $query->where('is_active', false),
            'low_stock' => $query->where(
                'stock',
                '<=',
                (int) config('shop.low_stock_threshold'),
            ),
            default => null,
        };

        $products = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/products', [
            'products' => $products,
            'categories' => Category::ordered()->get(),
            'filters' => [
                'q' => $validated['q'] ?? '',
                'status' => $validated['status'] ?? '',
            ],
            'statusOptions' => [
                ['value' => '', 'label' => 'All products'],
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'draft', 'label' => 'Drafts'],
                ['value' => 'low_stock', 'label' => 'Low stock'],
            ],
        ]);
    }

    /**
     * Show the create product form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/products/form', [
            'product' => null,
            'categories' => Category::ordered()->get(),
        ]);
    }

    /**
     * Persist a new product.
     */
    public function store(ProductRequest $request): RedirectResponse
    {
        Product::create($request->productAttributes());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Product created.',
        ]);

        return to_route('admin.products.index');
    }

    /**
     * Show the edit product form.
     */
    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/form', [
            'product' => $product->load('category'),
            'categories' => Category::ordered()->get(),
        ]);
    }

    /**
     * Update an existing product.
     */
    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->productAttributes());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Product updated.',
        ]);

        return to_route('admin.products.edit', $product);
    }

    /**
     * Delete a product from the catalog.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Product deleted.',
        ]);

        return to_route('admin.products.index');
    }
}
