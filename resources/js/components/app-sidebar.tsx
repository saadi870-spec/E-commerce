import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Package, ShieldCheck, Store } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, home } from '@/routes';
import * as adminRoutes from '@/routes/admin';
import * as orderRoutes from '@/routes/orders';
import type { NavItem, SharedProps } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedProps>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Storefront',
            href: home(),
            icon: Store,
        },
        {
            title: 'Orders',
            href: orderRoutes.index(),
            icon: Package,
        },
        ...(auth.user?.is_admin
            ? [
                  {
                      title: 'Admin',
                      href: adminRoutes.dashboard(),
                      icon: ShieldCheck,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
