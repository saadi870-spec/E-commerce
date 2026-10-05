import { Form, Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import ProductController from '@/actions/App/Http/Controllers/Admin/ProductController';
import { Pagination } from '@/components/store/pagination';
import { ProductImage } from '@/components/store/product-image';
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
import { formatMoney } from '@/lib/money';
import * as adminRoutes from '@/routes/admin';
import * as adminProductRoutes from '@/routes/admin/products';
import type { Category, Paginated, Product } from '@/types';

type Props = {
    products: Paginated<Product>;
    categories: Category[];
    filters: { q: string; status: string };
    statusOptions: { value: string; label: string }[];
};

export default function AdminProducts({
    products: paginator,
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
            adminProductRoutes.index.url({ query }),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <>
            <Head title="Products" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Products
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {paginator.total} products in the catalog
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={adminProductRoutes.create()}>
                            <Plus />
                            New product
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Form
                        action={adminProductRoutes.index.url()}
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
                            placeholder="Search name, SKU, category…"
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
                            <SelectItem value="all">All products</SelectItem>
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
                                <TableHead>Product</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">
                                    Price
                                </TableHead>
                                <TableHead className="text-right">
                                    Stock
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-24 text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginator.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No products match these filters.
                                    </TableCell>
                                </TableRow>
                            )}
                            {paginator.data.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <ProductImage
                                                product={product}
                                                compact
                                                className="size-11 shrink-0 rounded-md"
                                            />
                                            <div className="min-w-0">
                                                <Link
                                                    href={adminProductRoutes.edit(
                                                        product.id,
                                                    )}
                                                    className="block truncate text-sm font-medium hover:underline"
                                                >
                                                    {product.name}
                                                </Link>
                                                <span className="block text-xs text-muted-foreground">
                                                    {product.sku}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {product.category?.name ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-right text-sm tabular-nums">
                                        {formatMoney(product.price_cents)}
                                    </TableCell>
                                    <TableCell className="text-right text-sm tabular-nums">
                                        <span
                                            className={
                                                product.stock === 0
                                                    ? 'font-medium text-destructive'
                                                    : product.stock <= 5
                                                      ? 'font-medium text-amber-600'
                                                      : ''
                                            }
                                        >
                                            {product.stock}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                                product.is_active
                                                    ? 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300'
                                                    : 'bg-muted text-muted-foreground ring-border'
                                            }`}
                                        >
                                            {product.is_active
                                                ? 'Active'
                                                : 'Draft'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Edit ${product.name}`}
                                                asChild
                                            >
                                                <Link
                                                    href={adminProductRoutes.edit(
                                                        product.id,
                                                    )}
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                            </Button>

                                            <Form
                                                {...ProductController.destroy.form(
                                                    product.id,
                                                )}
                                                options={{
                                                    preserveScroll: true,
                                                }}
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-destructive"
                                                    aria-label={`Delete ${product.name}`}
                                                    onClick={(event) => {
                                                        if (
                                                            !window.confirm(
                                                                `Delete “${product.name}”? This cannot be undone.`,
                                                            )
                                                        ) {
                                                            event.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </Form>
                                        </div>
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

AdminProducts.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: adminRoutes.dashboard(),
        },
        {
            title: 'Products',
            href: adminProductRoutes.index(),
        },
    ],
};
