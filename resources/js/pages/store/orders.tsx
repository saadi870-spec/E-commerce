import { Head, Link } from '@inertiajs/react';
import { Package, PackageOpen } from 'lucide-react';
import { EmptyState } from '@/components/store/empty-state';
import { StatusBadge } from '@/components/store/status-badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatMoney } from '@/lib/money';
import { home } from '@/routes';
import * as orderRoutes from '@/routes/orders';
import * as products from '@/routes/products';
import type { Order, Paginated } from '@/types';

type Props = {
    orders: Paginated<Order>;
};

export default function OrderIndex({ orders }: Props) {
    const hasOrders = orders.data.length > 0;

    return (
        <>
            <Head title="Order history" />

            <div className="mx-auto max-w-4xl px-4 py-10">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Order history
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Every order placed with your account, newest first.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={products.index()}>Continue shopping</Link>
                    </Button>
                </div>

                {!hasOrders ? (
                    <EmptyState
                        icon={PackageOpen}
                        title="No orders yet"
                        description="When you place an order it will show up here with tracking and receipts."
                    >
                        <Button asChild>
                            <Link href={products.index()}>
                                Browse the catalog
                            </Link>
                        </Button>
                    </EmptyState>
                ) : (
                    <div className="space-y-4">
                        {orders.data.map((order) => {
                            const itemCount = (order.items ?? []).reduce(
                                (total, item) => total + item.quantity,
                                0,
                            );

                            return (
                                <article
                                    key={order.id}
                                    className="rounded-xl border border-border p-5 transition-colors hover:border-foreground/30"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Package className="size-4 text-muted-foreground" />
                                                <span className="text-sm font-semibold tracking-wide">
                                                    {order.number}
                                                </span>
                                                <StatusBadge
                                                    status={order.status}
                                                />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Placed{' '}
                                                {formatDate(order.placed_at)} ·{' '}
                                                {itemCount}{' '}
                                                {itemCount === 1
                                                    ? 'item'
                                                    : 'items'}{' '}
                                                ·{' '}
                                                {order.payment_method === 'card'
                                                    ? 'Card'
                                                    : 'Cash on delivery'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-semibold tabular-nums">
                                                {formatMoney(order.total_cents)}
                                            </span>
                                            <Button size="sm" asChild>
                                                <Link
                                                    href={orderRoutes.show(
                                                        order.number,
                                                    )}
                                                >
                                                    View order
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                <div className="mt-8">
                    <p className="text-sm text-muted-foreground">
                        Need to change something?{' '}
                        <Link
                            href={home()}
                            className="underline underline-offset-4"
                        >
                            Contact support
                        </Link>{' '}
                        within 24 hours of ordering.
                    </p>
                </div>
            </div>
        </>
    );
}
