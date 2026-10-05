import { Form, Head, Link, router } from '@inertiajs/react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Pagination } from '@/components/store/pagination';
import { ProductCard } from '@/components/store/product-card';
import { EmptyState } from '@/components/store/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { home } from '@/routes';
import * as products from '@/routes/products';
import type { Category, Paginated, Product } from '@/types';

type Filters = {
    q: string;
    category: string;
    min_price: string;
    max_price: string;
};

type Props = {
    products: Paginated<Product>;
    categories: Category[];
    activeCategory: Category | null;
    filters: Filters;
    sort: string;
    sortOptions: { value: string; label: string }[];
};

export default function ProductIndex({
    products: paginator,
    categories,
    activeCategory,
    filters,
    sort,
    sortOptions,
}: Props) {
    const activeFilters = [
        filters.q && { key: 'q' as const, label: `“${filters.q}”` },
        activeCategory && {
            key: 'category' as const,
            label: activeCategory.name,
        },
        filters.min_price && {
            key: 'min_price' as const,
            label: `Min $${filters.min_price}`,
        },
        filters.max_price && {
            key: 'max_price' as const,
            label: `Max $${filters.max_price}`,
        },
    ].filter(Boolean) as { key: keyof Filters; label: string }[];

    const changeSort = (value: string) => {
        router.get(
            products.index.url({
                query: {
                    ...(filters.q ? { q: filters.q } : {}),
                    ...(filters.category ? { category: filters.category } : {}),
                    ...(filters.min_price
                        ? { min_price: filters.min_price }
                        : {}),
                    ...(filters.max_price
                        ? { max_price: filters.max_price }
                        : {}),
                    sort: value,
                },
            }),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const clearFilters = () => {
        router.get(products.index.url(), {}, { preserveScroll: true });
    };

    return (
        <>
            <Head
                title={
                    activeCategory
                        ? activeCategory.name
                        : filters.q
                          ? `Search: ${filters.q}`
                          : 'Shop all'
                }
            />

            <div className="mx-auto max-w-7xl px-4 py-10">
                <div className="mb-8 flex flex-col gap-3">
                    <nav className="text-sm text-muted-foreground">
                        <Link href={home()} className="hover:text-foreground">
                            Home
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">
                            {activeCategory
                                ? activeCategory.name
                                : filters.q
                                  ? 'Search'
                                  : 'Shop'}
                        </span>
                    </nav>
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight">
                                {activeCategory?.name ?? 'All products'}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {activeCategory?.description ??
                                    'Everything we make, in one place.'}
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {paginator.total}{' '}
                            {paginator.total === 1 ? 'product' : 'products'}
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                    {/* Filters */}
                    <aside className="space-y-8">
                        <Form
                            action={products.index.url()}
                            method="get"
                            className="space-y-4"
                        >
                            <input
                                type="hidden"
                                name="category"
                                value={filters.category}
                            />
                            <input type="hidden" name="sort" value={sort} />
                            <div className="space-y-2">
                                <Label
                                    htmlFor="q"
                                    className="text-xs tracking-wide uppercase"
                                >
                                    Search
                                </Label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="q"
                                        type="search"
                                        name="q"
                                        defaultValue={filters.q}
                                        placeholder="Search…"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-medium tracking-wide uppercase">
                                    Price
                                </p>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        name="min_price"
                                        min={0}
                                        placeholder="Min"
                                        defaultValue={filters.min_price}
                                        aria-label="Minimum price"
                                    />
                                    <span className="text-muted-foreground">
                                        –
                                    </span>
                                    <Input
                                        type="number"
                                        name="max_price"
                                        min={0}
                                        placeholder="Max"
                                        defaultValue={filters.max_price}
                                        aria-label="Maximum price"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                Apply filters
                            </Button>
                        </Form>

                        <div className="space-y-1">
                            <p className="mb-2 text-xs font-medium tracking-wide uppercase">
                                Categories
                            </p>
                            <Link
                                href={products.index.url()}
                                className={
                                    !filters.category
                                        ? 'block rounded-md bg-accent px-2 py-1.5 text-sm font-medium'
                                        : 'block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground'
                                }
                            >
                                All products
                            </Link>
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={products.index({
                                        query: {
                                            ...(filters.q
                                                ? { q: filters.q }
                                                : {}),
                                            category: category.slug,
                                        },
                                    })}
                                    className={
                                        filters.category === category.slug
                                            ? 'flex items-center justify-between rounded-md bg-accent px-2 py-1.5 text-sm font-medium'
                                            : 'flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground'
                                    }
                                >
                                    <span>{category.name}</span>
                                    <span className="text-xs tabular-nums">
                                        {category.products_count ?? 0}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </aside>

                    {/* Results */}
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                {activeFilters.length > 0 ? (
                                    <>
                                        {activeFilters.map((filter) => (
                                            <button
                                                key={filter.key}
                                                type="button"
                                                onClick={() => {
                                                    const next = {
                                                        ...filters,
                                                        [filter.key]: '',
                                                    };
                                                    router.get(
                                                        products.index.url({
                                                            query: {
                                                                ...(next.q
                                                                    ? {
                                                                          q: next.q,
                                                                      }
                                                                    : {}),
                                                                ...(next.category
                                                                    ? {
                                                                          category:
                                                                              next.category,
                                                                      }
                                                                    : {}),
                                                                ...(next.min_price
                                                                    ? {
                                                                          min_price:
                                                                              next.min_price,
                                                                      }
                                                                    : {}),
                                                                ...(next.max_price
                                                                    ? {
                                                                          max_price:
                                                                              next.max_price,
                                                                      }
                                                                    : {}),
                                                                ...(sort !==
                                                                'newest'
                                                                    ? { sort }
                                                                    : {}),
                                                            },
                                                        }),
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    );
                                                }}
                                                className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs hover:bg-accent"
                                            >
                                                {filter.label}
                                                <X className="size-3" />
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                                        >
                                            Clear all
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        <SlidersHorizontal className="mr-1.5 inline size-4" />
                                        Filter by category or price
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Label
                                    htmlFor="sort"
                                    className="text-sm text-muted-foreground"
                                >
                                    Sort
                                </Label>
                                <Select value={sort} onValueChange={changeSort}>
                                    <SelectTrigger
                                        id="sort"
                                        className="h-9 w-[190px] text-sm"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sortOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {paginator.data.length > 0 ? (
                            <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
                                {paginator.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Search}
                                title="No products matched"
                                description="Try a different search term, or clear the filters to see the full catalog."
                            >
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                >
                                    Clear filters
                                </Button>
                            </EmptyState>
                        )}

                        <Pagination paginator={paginator} />
                    </div>
                </div>
            </div>
        </>
    );
}
