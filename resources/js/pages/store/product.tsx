import { Head, Link, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    Minus,
    Package,
    Plus,
    RefreshCcw,
    ShieldCheck,
    Truck,
} from 'lucide-react';
import { useState } from 'react';
import { AddToCartButton } from '@/components/store/add-to-cart-button';
import { Price } from '@/components/store/price';
import { ProductCard } from '@/components/store/product-card';
import { ProductImage } from '@/components/store/product-image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatMoney } from '@/lib/money';
import { home } from '@/routes';
import * as productRoutes from '@/routes/products';
import type { Product, SharedProps } from '@/types';

type Props = {
    product: Product;
    related: Product[];
};

const MAX_PER_LINE = 20;

export default function ProductShow({ product, related }: Props) {
    const { shop } = usePage<SharedProps>().props;
    const [quantity, setQuantity] = useState(1);

    const inStock = product.stock > 0;
    const maxQuantity = Math.min(product.stock, MAX_PER_LINE);

    const setClamped = (value: number) =>
        setQuantity(Math.max(1, Math.min(value, maxQuantity || 1)));

    return (
        <>
            <Head title={product.name} />

            <div className="mx-auto max-w-7xl px-4 py-10">
                <nav className="mb-8 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                    <Link href={home()} className="hover:text-foreground">
                        Home
                    </Link>
                    <ChevronRight className="size-3.5" />
                    <Link
                        href={productRoutes.index({
                            query: { category: product.category?.slug ?? '' },
                        })}
                        className="hover:text-foreground"
                    >
                        {product.category?.name ?? 'Shop'}
                    </Link>
                    <ChevronRight className="size-3.5" />
                    <span className="text-foreground">{product.name}</span>
                </nav>

                <div className="grid gap-10 lg:grid-cols-2">
                    <ProductImage
                        product={product}
                        className="aspect-square lg:sticky lg:top-32"
                    />

                    <div className="flex flex-col gap-5">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                                {product.category?.name}
                            </p>
                            <h1 className="text-3xl font-semibold tracking-tight">
                                {product.name}
                            </h1>
                            {product.tagline && (
                                <p className="text-muted-foreground">
                                    {product.tagline}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Price
                                priceCents={product.price_cents}
                                compareAtCents={product.compare_at_price_cents}
                                size="lg"
                            />
                            {inStock ? (
                                product.stock <= 5 ? (
                                    <span className="rounded-full bg-amber-500/12 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300">
                                        Only {product.stock} left
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300">
                                        In stock
                                    </span>
                                )
                            ) : (
                                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                    Out of stock
                                </span>
                            )}
                        </div>

                        <div className="prose-sm space-y-4 text-sm leading-relaxed text-muted-foreground">
                            {product.description
                                .split('\n\n')
                                .map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                        </div>

                        {product.specs && product.specs.length > 0 && (
                            <dl className="grid grid-cols-1 gap-2 rounded-xl border border-border p-4 text-sm sm:grid-cols-2">
                                {product.specs.map((spec) => (
                                    <div
                                        key={spec.label}
                                        className="flex items-center justify-between gap-4 sm:odd:pr-4"
                                    >
                                        <dt className="text-muted-foreground">
                                            {spec.label}
                                        </dt>
                                        <dd className="font-medium">
                                            {spec.value}
                                        </dd>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-muted-foreground">
                                        SKU
                                    </dt>
                                    <dd className="font-medium">
                                        {product.sku}
                                    </dd>
                                </div>
                            </dl>
                        )}

                        {/* Purchase */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex h-10 items-center rounded-md border border-border">
                                <button
                                    type="button"
                                    onClick={() => setClamped(quantity - 1)}
                                    disabled={!inStock || quantity <= 1}
                                    className="flex h-full w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus className="size-4" />
                                </button>
                                <span className="w-10 text-center text-sm font-medium tabular-nums">
                                    {inStock ? quantity : 0}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setClamped(quantity + 1)}
                                    disabled={
                                        !inStock || quantity >= maxQuantity
                                    }
                                    className="flex h-full w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                                    aria-label="Increase quantity"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>

                            <AddToCartButton
                                product={product}
                                quantity={inStock ? quantity : 1}
                                size="lg"
                                className="flex-1 sm:min-w-48"
                            />
                        </div>

                        <ul className="grid gap-3 rounded-xl border border-border p-4 text-sm text-muted-foreground sm:grid-cols-3">
                            <li className="flex items-center gap-2">
                                <Truck className="size-4 shrink-0" />
                                Free over{' '}
                                {formatMoney(shop.freeShippingOverCents)}
                            </li>
                            <li className="flex items-center gap-2">
                                <RefreshCcw className="size-4 shrink-0" />
                                30-day returns
                            </li>
                            <li className="flex items-center gap-2">
                                <ShieldCheck className="size-4 shrink-0" />
                                2-year warranty
                            </li>
                        </ul>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Package className="size-4" />
                            Ships in 1–2 business days from our workshop.
                        </div>
                    </div>
                </div>

                {related.length > 0 && (
                    <section className="mt-16">
                        <Separator className="mb-8" />
                        <div className="mb-6 flex items-end justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">
                                    You might also like
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    More from {product.category?.name}.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={productRoutes.index({
                                        query: {
                                            category:
                                                product.category?.slug ?? '',
                                        },
                                    })}
                                >
                                    View category
                                </Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                            {related.map((item) => (
                                <ProductCard key={item.id} product={item} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
