import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Package,
    Settings,
    ShieldCheck,
    ShoppingBag,
    Wallet,
} from 'lucide-react';
import { StatusBadge } from '@/components/store/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatMoney } from '@/lib/money';
import { dashboard } from '@/routes';
import * as adminRoutes from '@/routes/admin';
import * as orderRoutes from '@/routes/orders';
import * as productRoutes from '@/routes/products';
import { edit as editProfile } from '@/routes/profile';
import type { Order, SharedProps } from '@/types';

type Props = {
    stats: {
        orders: number;
        open_orders: number;
        spent_cents: number;
    };
    recentOrders: Order[];
};

export default function Dashboard({ stats, recentOrders }: Props) {
    const { auth } = usePage<SharedProps>().props;

    const cards = [
        {
            label: 'Orders placed',
            value: String(stats.orders),
            icon: Package,
        },
        {
            label: 'In progress',
            value: String(stats.open_orders),
            icon: ShoppingBag,
        },
        {
            label: 'Lifetime spend',
            value: formatMoney(stats.spent_cents),
            icon: Wallet,
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back, {auth.user?.name ?? 'there'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Your orders, account and shortcuts in one place.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={productRoutes.index()}>
                            Continue shopping
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
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
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                Recent orders
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={orderRoutes.index()}>View all</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="px-2">
                            {recentOrders.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No orders yet — your history will show
                                        up here.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        asChild
                                    >
                                        <Link href={productRoutes.index()}>
                                            Browse the catalog
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <ul className="divide-y divide-border">
                                    {recentOrders.map((order) => (
                                        <li key={order.id}>
                                            <Link
                                                href={orderRoutes.show(
                                                    order.number,
                                                )}
                                                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-accent/50"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">
                                                        {order.number}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(
                                                            order.placed_at,
                                                        )}
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
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Quick actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                className="justify-start"
                                asChild
                            >
                                <Link href={editProfile()}>
                                    <Settings />
                                    Account settings
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start"
                                asChild
                            >
                                <Link href={orderRoutes.index()}>
                                    <Package />
                                    Order history
                                </Link>
                            </Button>
                            {auth.user?.is_admin && (
                                <Button
                                    variant="outline"
                                    className="justify-start"
                                    asChild
                                >
                                    <Link href={adminRoutes.dashboard()}>
                                        <ShieldCheck />
                                        Admin area
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
