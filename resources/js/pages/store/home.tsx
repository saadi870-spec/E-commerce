import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    PackageCheck,
    RefreshCcw,
    Sparkles,
    Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/store/product-card';
import { ProductImage } from '@/components/store/product-image';
import * as products from '@/routes/products';
import type { Category, Product } from '@/types';

type Props = {
    categories: Category[];
    featured: Product[];
    latest: Product[];
};

const tileAccents = [
    '#0f766e',
    '#1d4ed8',
    '#b45309',
    '#7c3aed',
    '#be123c',
    '#0e7490',
];

const promises = [
    {
        icon: PackageCheck,
        title: 'Free shipping over $75',
        description: 'Tracked delivery in 2–4 business days.',
    },
    {
        icon: RefreshCcw,
        title: '30-day returns',
        description: 'Changed your mind? Send it back, no fuss.',
    },
    {
        icon: Wrench,
        title: 'Repaired for life',
        description: 'We fix what wears, at cost, forever.',
    },
    {
        icon: BadgeCheck,
        title: 'Small-batch quality',
        description: 'Made by partners we visit every year.',
    },
];

export default function StoreHome({ categories, featured, latest }: Props) {
    const heroProducts = (featured.length >= 3 ? featured : latest).slice(0, 3);
    const grid = featured.length > 0 ? featured : latest;

    return (
        <>
            <Head title="Considered goods for everyday life" />

            {/* Hero */}
            <section className="border-b border-border">
                <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-20">
                    <div className="flex flex-col items-start gap-6">
                        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                            <Sparkles className="size-3.5" />
                            Autumn 2026 collection
                        </span>
                        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                            Considered goods for everyday life.
                        </h1>
                        <p className="max-w-xl text-muted-foreground sm:text-lg">
                            Clothing, footwear and homeware made in small
                            batches from materials that age well — designed to
                            be repaired, not replaced.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button size="lg" asChild>
                                <Link href={products.index()}>
                                    Shop the collection
                                    <ArrowRight />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link
                                    href={products.index({
                                        query: { sort: 'price_asc' },
                                    })}
                                >
                                    Browse under $50
                                </Link>
                            </Button>
                        </div>
                        <dl className="flex gap-8 pt-2 text-sm">
                            <div>
                                <dt className="text-muted-foreground">
                                    Rating
                                </dt>
                                <dd className="font-semibold">4.9 / 5</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">
                                    Orders shipped
                                </dt>
                                <dd className="font-semibold">38,000+</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">
                                    Repairs this year
                                </dt>
                                <dd className="font-semibold">1,204</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="hidden gap-4 md:grid md:grid-cols-3">
                        {heroProducts.map((product, index) => (
                            <Link
                                key={product.id}
                                href={products.show(product.slug)}
                                className={index === 1 ? 'mt-8 block' : 'block'}
                            >
                                <ProductImage product={product} />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Promises */}
            <section className="border-b border-border bg-muted/40">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
                    {promises.map((promise) => (
                        <div
                            key={promise.title}
                            className="flex items-start gap-3"
                        >
                            <promise.icon className="mt-0.5 size-5 shrink-0 text-foreground/70" />
                            <div>
                                <p className="text-sm font-medium">
                                    {promise.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {promise.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories */}
            <section className="mx-auto max-w-7xl px-4 py-14">
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Shop by category
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Five ranges, one standard.
                        </p>
                    </div>
                    <Link
                        href={products.index()}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                        View all
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {categories.map((category, index) => {
                        const accent = tileAccents[index % tileAccents.length];

                        return (
                            <Link
                                key={category.id}
                                href={products.index({
                                    query: { category: category.slug },
                                })}
                                className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-xl border border-border p-4 transition-transform duration-300 hover:-translate-y-1"
                                style={{
                                    backgroundImage: `linear-gradient(140deg, ${accent}40 0%, ${accent}12 55%, transparent 100%)`,
                                }}
                            >
                                <span
                                    className="absolute -top-8 -right-6 size-32 rounded-full opacity-30 blur-2xl"
                                    style={{ backgroundColor: accent }}
                                />
                                <span className="relative text-sm font-semibold">
                                    {category.name}
                                </span>
                                <span className="relative text-xs text-muted-foreground">
                                    {category.products_count ?? 0} products
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Featured */}
            <section className="mx-auto max-w-7xl px-4 pb-14">
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Featured this month
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            The pieces we keep reaching for.
                        </p>
                    </div>
                    <Link
                        href={products.index()}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                        View all
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                    {grid.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Promise band */}
            <section className="border-y border-border bg-foreground text-background">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Our promise
                        </h2>
                        <p className="mt-2 text-sm opacity-70">
                            The short version of how we do business.
                        </p>
                    </div>
                    <div className="grid gap-6 md:col-span-2 md:grid-cols-2">
                        <div>
                            <p className="font-medium">
                                Honest materials, named
                            </p>
                            <p className="mt-1 text-sm opacity-70">
                                Every product page lists what it is made of and
                                where — no “premium blend” hand-waving.
                            </p>
                        </div>
                        <div>
                            <p className="font-medium">Fix it, don’t bin it</p>
                            <p className="mt-1 text-sm opacity-70">
                                Send anything back after its warranty and we
                                will repair it at cost for as long as we exist.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* New arrivals */}
            <section className="mx-auto max-w-7xl px-4 py-14">
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            New arrivals
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Fresh out of the workshop.
                        </p>
                    </div>
                    <Link
                        href={products.index()}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                        View all
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                    {latest.slice(0, 4).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </>
    );
}
