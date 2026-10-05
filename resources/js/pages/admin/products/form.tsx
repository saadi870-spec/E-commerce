import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ProductController from '@/actions/App/Http/Controllers/Admin/ProductController';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toDollars } from '@/lib/money';
import * as adminRoutes from '@/routes/admin';
import * as adminProductRoutes from '@/routes/admin/products';
import type { Category, Product, ProductSpec } from '@/types';

type Props = {
    product: Product | null;
    categories: Category[];
};

export default function ProductForm({ product, categories }: Props) {
    const isEditing = product !== null;
    const [specs, setSpecs] = useState<ProductSpec[]>(product?.specs ?? []);

    const addSpec = () =>
        setSpecs((current) => [...current, { label: '', value: '' }]);
    const removeSpec = (index: number) =>
        setSpecs((current) => current.filter((_, row) => row !== index));

    return (
        <>
            <Head title={isEditing ? `Edit ${product.name}` : 'New product'} />

            <div className="max-w-3xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {isEditing ? 'Edit product' : 'New product'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditing
                                ? `SKU ${product.sku}`
                                : 'Add a product to the storefront catalog.'}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={adminProductRoutes.index()}>
                            <ArrowLeft />
                            Back to products
                        </Link>
                    </Button>
                </div>

                <Form
                    {...(isEditing
                        ? ProductController.update.form(product.id)
                        : ProductController.store.form())}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <section className="space-y-4 rounded-xl border border-border p-5">
                                <h2 className="text-sm font-semibold tracking-wide uppercase">
                                    Details
                                </h2>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            defaultValue={product?.name ?? ''}
                                            placeholder="Heavyweight Oxford Shirt"
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input
                                            id="sku"
                                            name="sku"
                                            required
                                            defaultValue={product?.sku ?? ''}
                                            placeholder="APPAREL-001"
                                        />
                                        <InputError message={errors.sku} />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">
                                            Slug{' '}
                                            <span className="text-muted-foreground">
                                                (optional)
                                            </span>
                                        </Label>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            defaultValue={product?.slug ?? ''}
                                            placeholder="generated-from-name"
                                        />
                                        <InputError message={errors.slug} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category_id">
                                            Category
                                        </Label>
                                        <select
                                            id="category_id"
                                            name="category_id"
                                            required
                                            defaultValue={
                                                product
                                                    ? String(
                                                          product.category_id,
                                                      )
                                                    : (categories[0]?.id ?? '')
                                            }
                                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        >
                                            {categories.map((category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.category_id}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tagline">
                                        Tagline{' '}
                                        <span className="text-muted-foreground">
                                            (optional)
                                        </span>
                                    </Label>
                                    <Input
                                        id="tagline"
                                        name="tagline"
                                        defaultValue={product?.tagline ?? ''}
                                        placeholder="One short line shown under the product name"
                                    />
                                    <InputError message={errors.tagline} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        required
                                        rows={6}
                                        defaultValue={
                                            product?.description ?? ''
                                        }
                                        placeholder="Separate paragraphs with a blank line."
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </section>

                            <section className="space-y-4 rounded-xl border border-border p-5">
                                <h2 className="text-sm font-semibold tracking-wide uppercase">
                                    Pricing &amp; inventory
                                </h2>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">
                                            Price (USD)
                                        </Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            required
                                            defaultValue={toDollars(
                                                product?.price_cents ?? null,
                                            )}
                                            placeholder="79.00"
                                        />
                                        <InputError message={errors.price} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="compare_at_price">
                                            Compare-at{' '}
                                            <span className="text-muted-foreground">
                                                (optional)
                                            </span>
                                        </Label>
                                        <Input
                                            id="compare_at_price"
                                            name="compare_at_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            defaultValue={toDollars(
                                                product?.compare_at_price_cents ??
                                                    null,
                                            )}
                                            placeholder="99.00"
                                        />
                                        <InputError
                                            message={errors.compare_at_price}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Stock</Label>
                                        <Input
                                            id="stock"
                                            name="stock"
                                            type="number"
                                            min="0"
                                            required
                                            defaultValue={
                                                product
                                                    ? String(product.stock)
                                                    : '0'
                                            }
                                        />
                                        <InputError message={errors.stock} />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-end gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="accent_color">
                                            Artwork color
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="accent_color"
                                                name="accent_color"
                                                type="color"
                                                defaultValue={
                                                    product?.accent_color ??
                                                    '#3f3f46'
                                                }
                                                className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent p-1"
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                Used for the product artwork.
                                            </span>
                                        </div>
                                        <InputError
                                            message={errors.accent_color}
                                        />
                                    </div>

                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <Checkbox
                                            name="is_featured"
                                            defaultChecked={
                                                product?.is_featured ?? false
                                            }
                                        />
                                        Feature on the home page
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <Checkbox
                                            name="is_active"
                                            defaultChecked={
                                                product?.is_active ?? true
                                            }
                                        />
                                        Visible on the storefront
                                    </label>
                                </div>
                                <InputError message={errors.is_active} />
                            </section>

                            <section className="space-y-4 rounded-xl border border-border p-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-semibold tracking-wide uppercase">
                                        Specifications
                                    </h2>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addSpec}
                                    >
                                        <Plus />
                                        Add row
                                    </Button>
                                </div>

                                {specs.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No specifications yet — materials,
                                        dimensions and warranty make good rows.
                                    </p>
                                )}

                                <div className="space-y-3">
                                    {specs.map((spec, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-wrap items-center gap-3"
                                        >
                                            <Input
                                                name={`specs[${index}][label]`}
                                                defaultValue={spec.label}
                                                placeholder="Label, e.g. Material"
                                                aria-label={`Specification ${index + 1} label`}
                                                className="max-w-48 flex-1"
                                                required
                                            />
                                            <Input
                                                name={`specs[${index}][value]`}
                                                defaultValue={spec.value}
                                                placeholder="Value, e.g. Organic cotton"
                                                aria-label={`Specification ${index + 1} value`}
                                                className="max-w-72 flex-1"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Remove specification ${index + 1}`}
                                                onClick={() =>
                                                    removeSpec(index)
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.specs} />
                            </section>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    {isEditing
                                        ? 'Save changes'
                                        : 'Create product'}
                                </Button>
                                <Button variant="ghost" asChild>
                                    <Link href={adminProductRoutes.index()}>
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ProductForm.layout = ({ product }: Props) => ({
    breadcrumbs: [
        {
            title: 'Admin',
            href: adminRoutes.dashboard(),
        },
        {
            title: 'Products',
            href: adminProductRoutes.index(),
        },
        {
            title: product ? product.name : 'New product',
            href: adminProductRoutes.index(),
        },
    ],
});
