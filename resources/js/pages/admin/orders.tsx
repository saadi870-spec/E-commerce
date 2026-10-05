import { Form, Head, Link, router } from '@inertiajs/react';
import { ArrowUpRight, Search } from 'lucide-react';
import { Pagination } from '@/components/store/pagination';
import { StatusBadge } from '@/components/store/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate, formatMoney } from '@/lib/money';
import * as adminRoutes from '@/routes/admin';
import * as adminOrderRoutes from '@/routes/admin/orders';
import type { Order, Paginated } from '@/types';

type Props = {
    orders: Paginated<Order>;
    filters: { q: string; status: string };
    statusOptions: { value: string; label: string }[];
};

export default function AdminOrders({
    orders: paginator,
    filters,
    statusOptions,
}: Props) {
    const applyFilters = (next: { q?: string; status?: string }) => {
        const q = next.q ?? filters.q;
        const status = next.status ?? filters.status;
        const query: Record<string, string> = {};

        if (q) {
            query.q = q;
        }

        if (status) {
            query.status = status;
        }

        router.get(
            adminOrderRoutes.index.url({ query }),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <>
            <Head title="Orders" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Orders
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {paginator.total} orders ·{' '}
                            {
                                paginator.data.filter(
                                    (order) => order.status === 'pending',
                                ).length
                            }{' '}
                            awaiting payment
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Form
                        action={adminOrderRoutes.index.url()}
                        method="get"
                        className="relative"
                    >
                        <input
                            type="hidden"
                            name="status"
                            value={filters.status}
                        />
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            name="q"
                            defaultValue={filters.q}
                            placeholder="Search number, name, email…"
                            className="w-72 pl-9"
                        />
                    </Form>

                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(value) =>
                            applyFilters({
                                status: value === 'all' ? '' : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All orders</SelectItem>
                            {statusOptions
                                .filter((option) => option.value !== '')
                                .map((option) => (
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

                <div className="rounded-xl border border-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">
                                    Items
                                </TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-16 text-right">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginator.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No orders match these filters.
                                    </TableCell>
                                </TableRow>
                            )}

                            {paginator.data.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <Link
                                            href={adminOrderRoutes.show(
                                                order.number,
                                            )}
                                            className="text-sm font-medium hover:underline"
                                        >
                                            {order.number}
                                        </Link>
                                        <span className="block text-xs text-muted-foreground">
                                            {formatDate(order.placed_at)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="block text-sm">
                                            {order.name}
                                        </span>
                                        <span className="block text-xs text-muted-foreground">
                                            {order.email}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-sm tabular-nums">
                                        {(order.items ?? []).reduce(
                                            (total, item) =>
                                                total + item.quantity,
                                            0,
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {order.payment_method === 'card'
                                            ? 'Card'
                                            : 'Cash on delivery'}
                                    </TableCell>
                                    <TableCell className="text-right text-sm font-semibold tabular-nums">
                                        {formatMoney(order.total_cents)}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={order.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Open order ${order.number}`}
                                            asChild
                                        >
                                            <Link
                                                href={adminOrderRoutes.show(
                                                    order.number,
                                                )}
                                            >
                                                <ArrowUpRight className="size-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Pagination paginator={paginator} />
            </div>
        </>
    );
}

AdminOrders.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: adminRoutes.dashboard(),
        },
        {
            title: 'Orders',
            href: adminOrderRoutes.index(),
        },
    ],
};
