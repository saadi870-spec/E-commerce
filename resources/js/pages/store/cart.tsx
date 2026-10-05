import { Form, Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, ShoppingCart, Trash2 } from 'lucide-react';
import CartController from '@/actions/App/Http/Controllers/Store/CartController';
import { EmptyState } from '@/components/store/empty-state';
import { Price } from '@/components/store/price';
import { ProductImage } from '@/components/store/product-image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatMoney } from '@/lib/money';
import * as checkout from '@/routes/checkout';
import * as products from '@/routes/products';
import type { CartLine, OrderTotals, SharedProps } from '@/types';

type Props = {
    lines: CartLine[];
    summary: OrderTotals;
};

export default function CartIndex({ lines, summary }: Props) {
    const { shop } = usePage<SharedProps>().props;
    const remaining =
        shop.freeShippingOverCents > 0
            ? Math.max(0, shop.freeShippingOverCents - summary.subtotal_cents)
            : 0;

    if (lines.length === 0) {
        return (
            <>
                <Head title="Shopping cart" />
                <div className="mx-auto max-w-3xl px-4 py-16">
                    <h1 className="mb-6 text-3xl font-semibold tracking-tight">
                        Shopping cart
                    </h1>
                    <EmptyState
                        icon={ShoppingCart}
                        title="Your cart is empty"
                        description="Browse the collection and add something you will keep for years."
                    >
                        <Button asChild>
                            <Link href={products.index()}>
                                Start shopping
                                <ArrowRight />
                            </Link>
                        </Button>
                    </EmptyState>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Shopping cart" />

            <div className="mx-auto max-w-7xl px-4 py-10">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Shopping cart
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {summary.subtotal_cents > 0 &&
                                `${lines.length} ${lines.length === 1 ? 'item' : 'items'} · ${formatMoney(summary.subtotal_cents)}`}
                        </p>
                    </div>
                    <Link
                        href={products.index()}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                        Continue shopping
                    </Link>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-4">
                        {lines.map(
                            ({ product, quantity, line_total_cents }) => (
                                <article
                                    key={product.id}
                                    className="grid grid-cols-[80px_1fr] gap-4 rounded-xl border border-border p-4 sm:grid-cols-[96px_1fr]"
                                >
                                    <Link
                                        href={products.show(product.slug)}
                                        className="block"
                                    >
                                        <ProductImage
                                            product={product}
                                            className="aspect-[4/5] w-full"
                                        />
                                    </Link>

                                    <div className="flex flex-col justify-between gap-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <Link
                                                    href={products.show(
                                                        product.slug,
                                                    )}
                                                    className="block truncate text-sm font-medium hover:underline"
                                                >
                                                    {product.name}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.category?.name} ·{' '}
                                                    {product.sku}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    <Price
                                                        priceCents={
                                                            product.price_cents
                                                        }
                                                        compareAtCents={
                                                            product.compare_at_price_cents
                                                        }
                                                        showSaleTag={false}
                                                    />
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold tabular-nums">
                                                {formatMoney(line_total_cents)}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <Form
                                                {...CartController.update.form(
                                                    product.id,
                                                )}
                                                options={{
                                                    preserveScroll: true,
                                                }}
                                                className="flex h-9 items-center rounded-md border border-border"
                                            >
                                                <button
                                                    type="submit"
                                                    name="quantity"
                                                    value={quantity - 1}
                                                    className="flex h-full w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                                                    disabled={quantity <= 1}
                                                    aria-label={`Decrease quantity of ${product.name}`}
                                                >
                                                    −
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium tabular-nums">
                                                    {quantity}
                                                </span>
                                                <button
                                                    type="submit"
                                                    name="quantity"
                                                    value={quantity + 1}
                                                    className="flex h-full w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                                                    disabled={
                                                        quantity >=
                                                        product.stock
                                                    }
                                                    aria-label={`Increase quantity of ${product.name}`}
                                                >
                                                    +
                                                </button>
                                            </Form>

                                            <Form
                                                {...CartController.destroy.form(
                                                    product.id,
                                                )}
                                                options={{
                                                    preserveScroll: true,
                                                }}
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-destructive"
                                                    aria-label={`Remove ${product.name}`}
                                                >
                                                    <Trash2 />
                                                    Remove
                                                </Button>
                                            </Form>
                                        </div>
                                    </div>
                                </article>
                            ),
                        )}
                    </div>

                    <aside className="lg:sticky lg:top-32 lg:h-fit">
                        <div className="rounded-xl border border-border p-5">
                            <h2 className="text-sm font-semibold tracking-wide uppercase">
                                Order summary
                            </h2>

                            <dl className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">
                                        Subtotal
                                    </dt>
                                    <dd className="tabular-nums">
                                        {formatMoney(summary.subtotal_cents)}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">
                                        Shipping
                                    </dt>
                                    <dd className="tabular-nums">
                                        {summary.shipping_cents === 0
                                            ? 'Free'
                                            : formatMoney(
                                                  summary.shipping_cents,
                                              )}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">
                                        Tax (8%)
                                    </dt>
                                    <dd className="tabular-nums">
                                        {formatMoney(summary.tax_cents)}
                                    </dd>
                                </div>
                            </dl>

                            <Separator className="my-4" />

                            <div className="flex items-baseline justify-between">
                                <span className="text-sm font-semibold">
                                    Total
                                </span>
                                <span className="text-xl font-semibold tabular-nums">
                                    {formatMoney(summary.total_cents)}
                                </span>
                            </div>

                            {remaining > 0 && (
                                <p className="mt-3 rounded-md bg-accent px-3 py-2 text-xs text-muted-foreground">
                                    Add{' '}
                                    <span className="font-medium text-foreground">
                                        {formatMoney(remaining)}
                                    </span>{' '}
                                    more for free shipping.
                                </p>
                            )}

                            <Button size="lg" className="mt-4 w-full" asChild>
                                <Link href={checkout.create()}>
                                    Checkout
                                    <ArrowRight />
                                </Link>
                            </Button>

                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                Secure checkout · 30-day returns
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
