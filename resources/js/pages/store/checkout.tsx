import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    CreditCard,
    Lock,
    ShieldCheck,
} from 'lucide-react';
import CheckoutController from '@/actions/App/Http/Controllers/Store/CheckoutController';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatMoney } from '@/lib/money';
import { login } from '@/routes';
import * as cart from '@/routes/cart';
import * as products from '@/routes/products';
import type { CartLine, OrderTotals, SharedProps } from '@/types';

type Props = {
    lines: CartLine[];
    summary: OrderTotals;
    defaults: { name: string; email: string };
    old: Record<string, string>;
    paymentMethods: Record<string, string>;
};

const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
];

export default function CheckoutCreate({
    lines,
    summary,
    defaults,
    old,
    paymentMethods,
}: Props) {
    const { auth, shop } = usePage<SharedProps>().props;
    const value = (field: string, fallback = '') => old[field] ?? fallback;
    const selectedPayment = value('payment_method', 'card');

    return (
        <>
            <Head title="Checkout" />

            <div className="mx-auto max-w-7xl px-4 py-10">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Checkout
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {auth.user
                                ? `Signed in as ${auth.user.email}`
                                : 'Checking out as a guest — your order number will unlock on this device.'}
                        </p>
                    </div>
                    <Link
                        href={cart.index()}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                        Back to cart
                    </Link>
                </div>

                <Form
                    {...CheckoutController.store.form()}
                    className="grid gap-8 lg:grid-cols-[1fr_360px]"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-8">
                                {errors.cart && (
                                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                        {errors.cart}
                                    </div>
                                )}

                                <section className="rounded-xl border border-border p-5">
                                    <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">
                                        Contact
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                Email address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoComplete="email"
                                                defaultValue={value(
                                                    'email',
                                                    defaults.email,
                                                )}
                                                placeholder="you@example.com"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">
                                                Phone{' '}
                                                <span className="text-muted-foreground">
                                                    (optional)
                                                </span>
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                name="phone"
                                                autoComplete="tel"
                                                defaultValue={value('phone')}
                                                placeholder="+1 555 010 0000"
                                            />
                                            <InputError
                                                message={errors.phone}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-xl border border-border p-5">
                                    <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">
                                        Shipping address
                                    </h2>
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Full name
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                required
                                                autoComplete="name"
                                                defaultValue={value(
                                                    'name',
                                                    defaults.name,
                                                )}
                                                placeholder="Jordan Reyes"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address_line1">
                                                Address
                                            </Label>
                                            <Input
                                                id="address_line1"
                                                name="address_line1"
                                                required
                                                autoComplete="address-line1"
                                                defaultValue={value(
                                                    'address_line1',
                                                )}
                                                placeholder="128 Maple Street"
                                            />
                                            <InputError
                                                message={errors.address_line1}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address_line2">
                                                Apartment, suite, etc.{' '}
                                                <span className="text-muted-foreground">
                                                    (optional)
                                                </span>
                                            </Label>
                                            <Input
                                                id="address_line2"
                                                name="address_line2"
                                                autoComplete="address-line2"
                                                defaultValue={value(
                                                    'address_line2',
                                                )}
                                            />
                                            <InputError
                                                message={errors.address_line2}
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">
                                                    City
                                                </Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    required
                                                    autoComplete="address-level2"
                                                    defaultValue={value('city')}
                                                />
                                                <InputError
                                                    message={errors.city}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="state">
                                                    State / region
                                                </Label>
                                                <Input
                                                    id="state"
                                                    name="state"
                                                    required
                                                    autoComplete="address-level1"
                                                    defaultValue={value(
                                                        'state',
                                                    )}
                                                    placeholder="OR"
                                                />
                                                <InputError
                                                    message={errors.state}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="postal_code">
                                                    Postal code
                                                </Label>
                                                <Input
                                                    id="postal_code"
                                                    name="postal_code"
                                                    required
                                                    autoComplete="postal-code"
                                                    defaultValue={value(
                                                        'postal_code',
                                                    )}
                                                />
                                                <InputError
                                                    message={errors.postal_code}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="country">
                                                Country
                                            </Label>
                                            <select
                                                id="country"
                                                name="country"
                                                required
                                                defaultValue={value(
                                                    'country',
                                                    'US',
                                                )}
                                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            >
                                                {countries.map((country) => (
                                                    <option
                                                        key={country.value}
                                                        value={country.value}
                                                    >
                                                        {country.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={errors.country}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-xl border border-border p-5">
                                    <h2 className="mb-1 text-sm font-semibold tracking-wide uppercase">
                                        Payment
                                    </h2>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Demo store — payment is simulated and no
                                        card details are stored.
                                    </p>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors has-[:checked]:border-foreground has-[:checked]:bg-accent">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="card"
                                                defaultChecked={
                                                    selectedPayment === 'card'
                                                }
                                                className="mt-1"
                                            />
                                            <span className="flex-1">
                                                <span className="flex items-center gap-2 text-sm font-medium">
                                                    <CreditCard className="size-4" />
                                                    {paymentMethods.card ??
                                                        'Card'}
                                                </span>
                                                <span className="mt-1 block text-xs text-muted-foreground">
                                                    Charged immediately · marked
                                                    as paid
                                                </span>
                                            </span>
                                        </label>

                                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors has-[:checked]:border-foreground has-[:checked]:bg-accent">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="cod"
                                                defaultChecked={
                                                    selectedPayment === 'cod'
                                                }
                                                className="mt-1"
                                            />
                                            <span className="flex-1">
                                                <span className="flex items-center gap-2 text-sm font-medium">
                                                    <Banknote className="size-4" />
                                                    {paymentMethods.cod ??
                                                        'Cash on delivery'}
                                                </span>
                                                <span className="mt-1 block text-xs text-muted-foreground">
                                                    Pay the courier on arrival
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                    <InputError
                                        className="mt-3"
                                        message={errors.payment_method}
                                    />
                                </section>
                            </div>

                            {/* Summary */}
                            <aside className="lg:sticky lg:top-32 lg:h-fit">
                                <div className="rounded-xl border border-border p-5">
                                    <h2 className="text-sm font-semibold tracking-wide uppercase">
                                        Your order
                                    </h2>

                                    <ul className="mt-4 space-y-3">
                                        {lines.map(
                                            ({
                                                product,
                                                quantity,
                                                line_total_cents,
                                            }) => (
                                                <li
                                                    key={product.id}
                                                    className="flex items-start justify-between gap-3 text-sm"
                                                >
                                                    <span className="min-w-0">
                                                        <span className="block truncate font-medium">
                                                            {product.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Qty {quantity}
                                                        </span>
                                                    </span>
                                                    <span className="shrink-0 tabular-nums">
                                                        {formatMoney(
                                                            line_total_cents,
                                                        )}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>

                                    <Separator className="my-4" />

                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">
                                                Subtotal
                                            </dt>
                                            <dd className="tabular-nums">
                                                {formatMoney(
                                                    summary.subtotal_cents,
                                                )}
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
                                                Tax (
                                                {Math.round(shop.taxRate * 100)}
                                                %)
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

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="mt-4 w-full"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Place order
                                    </Button>

                                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                                        <Lock className="size-3.5" />
                                        Encrypted checkout ·{' '}
                                        <ShieldCheck className="size-3.5" />
                                        30-day returns
                                    </p>

                                    {!auth.user && (
                                        <p className="mt-3 text-center text-xs text-muted-foreground">
                                            Have an account?{' '}
                                            <Link
                                                href={login()}
                                                className="underline underline-offset-4"
                                            >
                                                Sign in
                                            </Link>{' '}
                                            to track orders automatically.
                                        </p>
                                    )}
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-3 w-full"
                                    asChild
                                >
                                    <Link href={products.index()}>
                                        <ArrowLeft />
                                        Keep shopping
                                    </Link>
                                </Button>
                            </aside>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
