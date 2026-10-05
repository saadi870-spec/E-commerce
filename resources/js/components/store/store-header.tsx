import { Form, Link, usePage } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import {
    LayoutGrid,
    Menu,
    Package,
    Search,
    Settings,
    ShoppingBag,
    User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { formatMoney } from '@/lib/money';
import { dashboard, home, login } from '@/routes';
import * as admin from '@/routes/admin';
import * as cart from '@/routes/cart';
import * as orders from '@/routes/orders';
import { edit as editProfile } from '@/routes/profile';
import * as products from '@/routes/products';
import type { SharedProps } from '@/types';

export function StoreHeader() {
    const {
        auth,
        cart: cartSummary,
        categories,
        shop,
    } = usePage<SharedProps>().props;
    const getInitials = useInitials();

    return (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="bg-foreground text-background">
                <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 text-[11px] tracking-wide">
                    <p className="truncate">
                        Free shipping over{' '}
                        {formatMoney(shop.freeShippingOverCents)} · 30-day
                        returns · Repaired for life
                    </p>
                    <p className="hidden shrink-0 sm:block">
                        Support Mon–Fri, 9–6 ET
                    </p>
                </div>
            </div>

            <div className="border-b border-border">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
                    {/* Mobile navigation */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                aria-label="Open menu"
                            >
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="flex w-72 flex-col"
                        >
                            <SheetTitle className="sr-only">
                                Navigation menu
                            </SheetTitle>
                            <SheetHeader>
                                <Link href={home()} className="font-semibold">
                                    {shop.name}
                                </Link>
                            </SheetHeader>
                            <nav className="flex flex-col gap-1 text-sm">
                                <Link
                                    href={products.index()}
                                    className="rounded-md px-2 py-2 font-medium hover:bg-accent"
                                >
                                    Shop all
                                </Link>
                                {categories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={products.index({
                                            query: { category: category.slug },
                                        })}
                                        className="rounded-md px-2 py-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </nav>
                            <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4 text-sm">
                                {auth.user ? (
                                    <>
                                        <Link
                                            href={orders.index()}
                                            className="rounded-md px-2 py-2 hover:bg-accent"
                                        >
                                            Order history
                                        </Link>
                                        <Link
                                            href={dashboard()}
                                            className="rounded-md px-2 py-2 hover:bg-accent"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href={login()}
                                            className="rounded-md px-2 py-2 hover:bg-accent"
                                        >
                                            Account settings
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        href={login()}
                                        className="rounded-md px-2 py-2 font-medium hover:bg-accent"
                                    >
                                        Sign in
                                    </Link>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Wordmark */}
                    <Link
                        href={home()}
                        className="flex shrink-0 items-center gap-2"
                    >
                        <span className="flex size-8 items-center justify-center rounded-md bg-foreground text-sm font-bold text-background">
                            M
                        </span>
                        <span className="flex flex-col leading-none">
                            <span className="text-sm font-semibold tracking-tight">
                                Meridian
                            </span>
                            <span className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                                Supply Co.
                            </span>
                        </span>
                    </Link>

                    {/* Desktop navigation */}
                    <nav className="ml-6 hidden items-center gap-1 lg:flex">
                        <NavLink href={products.index()} label="Shop all" />
                        {categories.map((category) => (
                            <NavLink
                                key={category.id}
                                href={products.index({
                                    query: { category: category.slug },
                                })}
                                label={category.name}
                            />
                        ))}
                    </nav>

                    {/* Search */}
                    <Form
                        action={products.index.url()}
                        method="get"
                        className="relative ml-auto hidden max-w-xs flex-1 md:block"
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            name="q"
                            placeholder="Search products…"
                            className="h-9 pr-3 pl-9"
                            autoComplete="off"
                        />
                    </Form>

                    <div className="ml-auto flex items-center gap-1 md:ml-2">
                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="size-9 rounded-full p-1"
                                        aria-label="Account"
                                    >
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56"
                                    align="end"
                                >
                                    <DropdownMenuLabel className="p-0 font-normal">
                                        <div className="px-1 py-1.5 text-sm">
                                            <p className="font-medium">
                                                {auth.user.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {auth.user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={orders.index()}
                                                className="cursor-pointer"
                                            >
                                                <Package className="mr-2 size-4" />
                                                Order history
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={editProfile()}
                                                className="cursor-pointer"
                                            >
                                                <Settings className="mr-2 size-4" />
                                                Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        {auth.user.is_admin && (
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href={admin.dashboard()}
                                                    className="cursor-pointer"
                                                >
                                                    <LayoutGrid className="mr-2 size-4" />
                                                    Admin area
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden sm:flex"
                                asChild
                            >
                                <Link href={login()}>
                                    <User className="size-4" />
                                    Sign in
                                </Link>
                            </Button>
                        )}

                        <Button variant="ghost" size="sm" asChild>
                            <Link href={cart.index()} className="relative">
                                <ShoppingBag className="size-4" />
                                <span className="hidden sm:inline">Cart</span>
                                {cartSummary.count > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                                        {cartSummary.count}
                                    </span>
                                )}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}

function NavLink({
    href,
    label,
}: {
    href: NonNullable<InertiaLinkProps['href']>;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
            {label}
        </Link>
    );
}
