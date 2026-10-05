import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CircleCheck,
    CreditCard,
    MapPin,
    PackageX,
    Truck,
} from 'lucide-react';
import { StatusBadge } from '@/components/store/status-badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDateTime, formatMoney } from '@/lib/money';
import * as adminOrders from '@/routes/admin/orders';
import * as orders from '@/routes/orders';
import * as products from '@/routes/products';
import type { Order, OrderStatus, SharedProps } from '@/types';

type Props = {
    order: Order;
    canManage: boolean;
};

/**
 * How many delivery steps have been completed for each status.
 */
const deliveryStages: Record<OrderStatus, number> = {
    pending: 1,
    paid: 2,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: 0,
};

export default function OrderShow({ order, canManage }: Props) {
    const { shop } = usePage<SharedProps>().props;
    const cancelled = order.status === 'cancelled';
    const items = order.items ?? [];

    return (
        <>
            <Head title={`Order ${order.number}`} />

            <div className="mx-auto max-w-4xl px-4 py-10">
                {/* Confirmation banner */}
                <div
                    className={`mb-8 rounded-xl border p-6 ${
                        cancelled
                            ? 'border-rose-500/30 bg-rose-500/5'
                            : 'border-emerald-500/30 bg-emerald-500/5'
                    }`}
                >
                    <div className="flex items-start gap-4">
                        {cancelled ? (
                            <PackageX className="mt-0.5 size-6 text-rose-600" />
                        ) : (
                            <CircleCheck className="mt-0.5 size-6 text-emerald-600" />
                        )}
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">
                                {cancelled
                                    ? `Order ${order.number} was cancelled`
                                    : `Order ${order.number} confirmed`}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {cancelled
                                    ? 'Any payment will be refunded within 3 business days.'
                                    : `A receipt has been sent to ${order.email}. We will notify you when it ships.`}
                            </p>
                        </div>
                        <div className="ml-auto hidden sm:block">
                            <StatusBadge status={order.status} />
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Placed {formatDateTime(order.placed_at)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Payment:{' '}
                            {order.payment_method === 'card'
                                ? 'Credit or debit card'
                                : 'Cash on delivery'}
                        </p>
                    </div>
                    <div className="sm:hidden">
                        <StatusBadge status={order.status} />
                    </div>
                </div>

                {/* Items */}
                <section className="rounded-xl border border-border">
                    <div className="border-b border-border px-5 py-4">
                        <h2 className="text-sm font-semibold tracking-wide uppercase">
                            Items
                        </h2>
                    </div>
                    <ul className="divide-y divide-border">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between gap-4 px-5 py-4"
                            >
                                <div className="min-w-0">
                                    <Link
                                        href={products.show(item.slug)}
                                        className="block truncate text-sm font-medium hover:underline"
                                    >
                                        {item.name}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
                                        {formatMoney(item.price_cents)} ×{' '}
                                        {item.quantity}
                                    </p>
                                </div>
                                <span className="shrink-0 text-sm font-semibold tabular-nums">
                                    {formatMoney(
                                        item.price_cents * item.quantity,
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div className="border-t border-border px-5 py-4">
                        <dl className="ml-auto w-full max-w-xs space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">
                                    Subtotal
                                </dt>
                                <dd className="tabular-nums">
                                    {formatMoney(order.subtotal_cents)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">
                                    Shipping
                                </dt>
                                <dd className="tabular-nums">
                                    {order.shipping_cents === 0
                                        ? 'Free'
                                        : formatMoney(order.shipping_cents)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Tax</dt>
                                <dd className="tabular-nums">
                                    {formatMoney(order.tax_cents)}
                                </dd>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-base font-semibold">
                                <dt>Total</dt>
                                <dd className="tabular-nums">
                                    {formatMoney(order.total_cents)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </section>

                {/* Delivery + customer */}
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <section className="rounded-xl border border-border p-5">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
                            <MapPin className="size-4" /> Shipping to
                        </h2>
                        <address className="text-sm text-muted-foreground not-italic">
                            <span className="block font-medium text-foreground">
                                {order.name}
                            </span>
                            {order.address_line1}
                            {order.address_line2 && (
                                <span className="block">
                                    {order.address_line2}
                                </span>
                            )}
                            <span className="block">
                                {order.city}, {order.state} {order.postal_code}
                            </span>
                            <span className="block">{order.country}</span>
                            {order.phone && (
                                <span className="block">{order.phone}</span>
                            )}
                        </address>
                    </section>

                    <section className="rounded-xl border border-border p-5">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
                            <Truck className="size-4" /> Delivery status
                        </h2>
                        <ol className="space-y-3 text-sm">
                            {[
                                'Order placed',
                                'Payment confirmed',
                                'Packed and shipped',
                                'Delivered',
                            ].map((step, index) => {
                                const stage = deliveryStages[order.status] ?? 0;
                                const reached = !cancelled && index < stage;

                                return (
                                    <li
                                        key={step}
                                        className="flex items-center gap-3"
                                    >
                                        <span
                                            className={`size-2.5 rounded-full ${
                                                reached
                                                    ? 'bg-foreground'
                                                    : 'bg-border'
                                            }`}
                                        />
                                        <span
                                            className={
                                                reached
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            {step}
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CreditCard className="size-3.5" />
                            Free returns within 30 days · {shop.name} covers
                            return labels.
                        </p>
                    </section>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href={products.index()}>
                            Continue shopping
                            <ArrowRight />
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={orders.index()}>View all orders</Link>
                    </Button>
                    {canManage && (
                        <Button variant="outline" asChild>
                            <Link href={adminOrders.show(order.number)}>
                                Manage in admin
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
