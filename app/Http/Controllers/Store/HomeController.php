<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Render the storefront home page.
     */
    public function index(): Response
    {
        return Inertia::render('store/home', [
            'categories' => Category::ordered()
                ->withCount([
                    'products as products_count' => fn ($query) => $query->where('is_active', true),
                ])
                ->get(),
            'featured' => Product::query()
                ->active()
                ->featured()
                ->with('category')
                ->latest()
                ->limit(8)
                ->get(),
            'latest' => Product::query()
                ->active()
                ->with('category')
                ->latest('id')
                ->limit(8)
                ->get(),
        ]);
    }
}
