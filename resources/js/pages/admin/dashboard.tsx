import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    Boxes,
    CircleDollarSign,
    PackageCheck,
    ShoppingBag,
    Users,
} from 'lucide-react';
import { StatusBadge } from '@/components/store/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney } from '@/lib/money';
import * as adminRoutes from '@/routes/admin';
import * as adminOrderRoutes from '@/routes/admin/orders';
import * as adminProductRoutes from '@/routes/admin/products';
import * as productRoutes from '@/routes/products';
import type { Order, Product } from '@/types';

type Stats = {
    revenue_cents: number;
    orders_count: number;
    open_orders_count: number;
    customers_count: number;
    products_count: number;
    low_stock_count: number;
};

type TopProductRow = {
    product: {
        id: number;
        name: string;
        slug: string;
        accent_color: string;
    } | null;
    units: number;
};

type Props = {
    stats: Stats;
    revenueSeries: { date: string; total_cents: number }[];
    recentOrders: Order[];
    lowStockProducts: Product[];
    topProducts: TopProductRow[];
    lowStockThreshold: number;
};

export default function AdminDashboard({
    stats,
    revenueSeries,
    recentOrders,
    lowStockProducts,
    topProducts,
    lowStockThreshold,
}: Props) {
    const peak = Math.max(
        1,
        ...revenueSeries.map((point) => point.total_cents),
    );

    const cards = [
        {
            label: 'Revenue',
            value: formatMoney(stats.revenue_cents),
            hint: 'All-time, excluding cancellations',
            icon: CircleDollarSign,
        },
        {
            label: 'Orders',
            value: String(stats.orders_count),
            hint: `${stats.open_orders_count} still open`,
            icon: ShoppingBag,
        },
        {
            label: 'Customers',
            value: String(stats.customers_count),
            hint: 'Registered accounts',
            icon: Users,
        },
        {
            label: 'Active products',
            value: String(stats.products_count),
            hint: `${stats.low_stock_count} low on stock`,
            icon: Boxes,
        },
    ];

    return (
        <>
            <Head title="Store overview" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Store overview
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Trading snapshot across the last 14 days.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={adminProductRoutes.create()}>
                                New product
                            </Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={productRoutes.index()}>
                                View storefront
                                <ArrowUpRight />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <Card key={card.label} className="gap-2 py-5">
                            <CardHeader className="px-5">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <card.icon className="size-4" />
                                    {card.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-5">
                                <p className="text-2xl font-semibold tabular-nums">
                                    {card.value}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {card.hint}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Revenue chart */}
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-base">
                            Revenue · last 14 days
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                            Peak {formatMoney(peak)}/day
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-40 items-end gap-1.5">
                            {revenueSeries.map((point) => {
                                const height = (point.total_cents / peak) * 100;

                                return (
                                    <div
                                        key={point.date}
                                        className="group relative flex-1"
                                        style={{
                                            height: `${Math.max(3, height)}%`,
                                        }}
                                        title={`${point.date} · ${formatMoney(point.total_cents)}`}
                                    >
                                        <div className="h-full w-full rounded-t-sm bg-foreground/80 transition-colors group-hover:bg-foreground" />
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <span>{revenueSeries[0]?.date}</span>
                            <span>
                                {revenueSeries[revenueSeries.length - 1]?.date}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent orders */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                Recent orders
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={adminOrderRoutes.index()}>
                                    View all
                                    <ArrowUpRight />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="px-2">
                            <ul className="divide-y divide-border">
                                {recentOrders.map((order) => (
                                    <li key={order.id}>
                                        <Link
                                            href={adminOrderRoutes.show(
                                                order.number,
                                            )}
                                            className="flex items-center justify-between gap-4 px-3 py-3 transition-colors hover:bg-accent/50"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {order.number}
                                                    <span className="ml-2 font-normal text-muted-foreground">
                                                        {order.name}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.items?.reduce(
                                                        (total, item) =>
                                                            total +
                                                            item.quantity,
                                                        0,
                                                    ) ?? 0}{' '}
                                                    items
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <StatusBadge
                                                    status={order.status}
                                                />
                                                <span className="text-sm font-semibold tabular-nums">
                                                    {formatMoney(
                                                        order.total_cents,
                                                    )}
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Low stock + top products */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <AlertTriangle className="size-4 text-amber-600" />
                                    Low stock
                                </CardTitle>
                                <span className="text-xs text-muted-foreground">
                                    ≤ {lowStockThreshold} left
                                </span>
                            </CardHeader>
                            <CardContent className="px-2">
                                {lowStockProducts.length === 0 ? (
                                    <p className="px-3 py-2 text-sm text-muted-foreground">
                                        Everything is comfortably stocked.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-border">
                                        {lowStockProducts.map((product) => (
                                            <li key={product.id}>
                                                <Link
                                                    href={adminProductRoutes.edit(
                                                        product.id,
                                                    )}
                                                    className="flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-accent/50"
                                                >
                                                    <span className="truncate text-sm">
                                                        {product.name}
                                                    </span>
                                                    <span
                                                        className={`text-sm font-semibold tabular-nums ${
                                                            product.stock === 0
                                                                ? 'text-destructive'
                                                                : 'text-amber-600'
                                                        }`}
                                                    >
                                                        {product.stock === 0
                                                            ? 'Out'
                                                            : product.stock}
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <PackageCheck className="size-4" />
                                    Best sellers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-2">
                                <ul className="divide-y divide-border">
                                    {topProducts.map((row) => (
                                        <li
                                            key={row.product?.id ?? row.units}
                                            className="flex items-center justify-between gap-3 px-3 py-2.5"
                                        >
                                            <span className="truncate text-sm">
                                                {row.product?.name ??
                                                    'Deleted product'}
                                            </span>
                                            <span className="text-sm text-muted-foreground tabular-nums">
                                                {row.units} sold
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: adminRoutes.dashboard(),
        },
        {
            title: 'Overview',
            href: adminRoutes.dashboard(),
        },
    ],
};
