import { Link, usePage } from '@inertiajs/react';
import { HeartHandshake, Lock, RotateCcw, Truck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatMoney } from '@/lib/money';
import { dashboard, home, login } from '@/routes';
import * as admin from '@/routes/admin';
import * as orders from '@/routes/orders';
import * as products from '@/routes/products';
import type { SharedProps } from '@/types';

export function StoreFooter() {
    const { auth, categories, shop } = usePage<SharedProps>().props;
    const [email, setEmail] = useState('');

    const subscribe = (event: React.FormEvent) => {
        event.preventDefault();
        setEmail('');
        toast.success('Thanks — you are on the list.');
    };

    return (
        <footer className="border-t border-border bg-muted/30">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-md bg-foreground text-sm font-bold text-background">
                            M
                        </span>
                        <span className="text-sm font-semibold">
                            {shop.name}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Considered goods for everyday life — made in small
                        batches, backed for years, repaired when they wear.
                    </p>
                    <div className="flex gap-4 pt-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                            <Truck className="size-3.5" /> Free shipping over{' '}
                            {formatMoney(shop.freeShippingOverCents)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Lock className="size-3.5" /> Secure checkout
                        </span>
                    </div>
                </div>

                <nav className="space-y-2 text-sm">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Shop
                    </p>
                    <Link
                        href={products.index()}
                        className="block text-muted-foreground hover:text-foreground"
                    >
                        All products
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={products.index({
                                query: { category: category.slug },
                            })}
                            className="block text-muted-foreground hover:text-foreground"
                        >
                            {category.name}
                        </Link>
                    ))}
                </nav>

                <nav className="space-y-2 text-sm">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Account
                    </p>
                    {auth.user ? (
                        <>
                            <Link
                                href={orders.index()}
                                className="block text-muted-foreground hover:text-foreground"
                            >
                                Order history
                            </Link>
                            <Link
                                href={dashboard()}
                                className="block text-muted-foreground hover:text-foreground"
                            >
                                Dashboard
                            </Link>
                            {auth.user.is_admin && (
                                <Link
                                    href={admin.dashboard()}
                                    className="block text-muted-foreground hover:text-foreground"
                                >
                                    Admin area
                                </Link>
                            )}
                        </>
                    ) : (
                        <Link
                            href={login()}
                            className="block text-muted-foreground hover:text-foreground"
                        >
                            Sign in
                        </Link>
                    )}
                    <Link
                        href={home()}
                        className="block text-muted-foreground hover:text-foreground"
                    >
                        Shipping &amp; returns
                    </Link>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <RotateCcw className="size-3.5" /> 30-day returns
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <HeartHandshake className="size-3.5" /> Lifetime repairs
                    </span>
                </nav>

                <div className="space-y-3 text-sm">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Stay in the loop
                    </p>
                    <p className="text-muted-foreground">
                        New drops, restocks and field notes. One email a month,
                        no filler.
                    </p>
                    <form onSubmit={subscribe} className="flex gap-2">
                        <Input
                            type="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            aria-label="Email address"
                            className="h-9"
                        />
                        <Button type="submit" size="sm" className="h-9">
                            Join
                        </Button>
                    </form>
                </div>
            </div>

            <div className="border-t border-border">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
                    <p>
                        © {new Date().getFullYear()} {shop.name}. All rights
                        reserved.
                    </p>
                    <p>
                        Visa · Mastercard · Amex · Apple Pay · Cash on delivery
                    </p>
                </div>
            </div>
        </footer>
    );
}
