import { StoreFooter } from '@/components/store/store-footer';
import { StoreHeader } from '@/components/store/store-header';
import type { AppLayoutProps } from '@/types';

export default function StorefrontLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <StoreHeader />
            <main className="flex-1">{children}</main>
            <StoreFooter />
        </div>
    );
}
