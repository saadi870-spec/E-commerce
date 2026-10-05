import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import OrderController from '@/actions/App/Http/Controllers/Admin/OrderController';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/store/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDateTime, formatMoney } from '@/lib/money';
import * as adminRoutes from '@/routes/admin';
import * as adminOrderRoutes from '@/routes/admin/orders';
import type { Order } from '@/types';

type Props = {
    order: Order;
    statusOptions: { value: string; label: string }[];
};

export default function AdminOrderShow({ order, statusOptions }: Props) {
    const items = order.items ?? [];
    const itemsCount = items.reduce((total, item) => total + item.quantity, 0);

    return (
        <>
            <Head title={`Order ${order.number}`} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link
                                href={adminOrderRoutes.index()}
                                aria-label="Back to orders"
                            >
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {order.number}
                                </h1>
                                <StatusBadge status={order.status} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Placed {formatDateTime(order.placed_at)} ·{' '}
                                {itemsCount}{' '}
                                {itemsCount === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {/* Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Line items
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-2">
                                <ul className="divide-y divide-border">
                                    {items.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex items-center justify-between gap-4 px-4 py-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatMoney(
                                                        item.price_cents,
                                                    )}{' '}
                                                    × {item.quantity}
                                                    {item.product && (
                                                        <>
                                                            {' '}
                                                            · in stock:{' '}
                                                            {item.product.stock}
                                                        </>
                                                    )}
                                                    {!item.product && (
                                                        <> · product removed</>
                                                    )}
                                                </p>
                                            </div>
                                            <span className="text-sm font-semibold tabular-nums">
                                                {formatMoney(
                                                    item.price_cents *
                                                        item.quantity,
                                                )}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Customer + shipping */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Customer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p className="font-medium">{order.name}</p>
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="size-3.5" />
                                        {order.email}
                                    </p>
                                    {order.phone && (
                                        <p className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="size-3.5" />
                                            {order.phone}
                                        </p>
                                    )}
                                    {order.user ? (
                                        <p className="text-xs text-muted-foreground">
                                            Registered account ·{' '}
                                            {order.user.name}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            Guest checkout
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Shipping address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <address className="flex gap-2 text-sm text-muted-foreground not-italic">
                                        <MapPin className="mt-0.5 size-4 shrink-0" />
                                        <span>
                                            {order.address_line1}
                                            {order.address_line2 && (
                                                <span className="block">
                                                    {order.address_line2}
                                                </span>
                                            )}
                                            <span className="block">
                                                {order.city}, {order.state}{' '}
                                                {order.postal_code}
                                            </span>
                                            <span className="block">
                                                {order.country}
                                            </span>
                                        </span>
                                    </address>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right rail */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Fulfillment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form
                                    {...OrderController.updateStatus.form(
                                        order.number,
                                    )}
                                    options={{ preserveScroll: true }}
                                    className="space-y-4"
                                >
                                    {({ processing }) => (
                                        <>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="status"
                                                    className="text-sm font-medium"
                                                >
                                                    Order status
                                                </label>
                                                <select
                                                    id="status"
                                                    name="status"
                                                    defaultValue={order.status}
                                                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                >
                                                    {statusOptions
                                                        .filter(
                                                            (option) =>
                                                                option.value !==
                                                                '',
                                                        )
                                                        .map((option) => (
                                                            <option
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={processing}
                                            >
                                                {processing && <Spinner />}
                                                Update status
                                            </Button>
                                        </>
                                    )}
                                </Form>

                                <p className="mt-3 text-xs text-muted-foreground">
                                    Cancelling an order returns its items to
                                    stock; reopening a cancelled order reserves
                                    stock again.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Payment summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-2 text-sm">
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
                                                : formatMoney(
                                                      order.shipping_cents,
                                                  )}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            Tax
                                        </dt>
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

                                <p className="mt-4 flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-xs text-muted-foreground">
                                    <ShieldCheck className="size-3.5" />
                                    {order.payment_method === 'card'
                                        ? 'Card charged in demo mode'
                                        : 'Collect cash on delivery'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminOrderShow.layout = ({ order }: Props) => ({
    breadcrumbs: [
        {
            title: 'Admin',
            href: adminRoutes.dashboard(),
        },
        {
            title: 'Orders',
            href: adminOrderRoutes.index(),
        },
        {
            title: order.number,
            href: adminOrderRoutes.show(order.number),
        },
    ],
});
