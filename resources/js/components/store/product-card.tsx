import { Link } from '@inertiajs/react';
import { AddToCartButton } from '@/components/store/add-to-cart-button';
import { Price } from '@/components/store/price';
import { ProductImage } from '@/components/store/product-image';
import * as products from '@/routes/products';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

type Props = {
    product: Product;
    className?: string;
    showAddToCart?: boolean;
};

export function ProductCard({
    product,
    className,
    showAddToCart = true,
}: Props) {
    const compare = product.compare_at_price_cents;
    const discount =
        typeof compare === 'number' && compare > product.price_cents
            ? Math.round((1 - product.price_cents / compare) * 100)
            : 0;
    const onSale = discount > 0;
    const almostGone = product.stock > 0 && product.stock <= 5;

    return (
        <article className={cn('group flex flex-col gap-3', className)}>
            <Link
                href={products.show(product.slug)}
                className="relative block transition-transform duration-300 group-hover:-translate-y-1"
                aria-label={product.name}
            >
                <ProductImage product={product} />
                {onSale && (
                    <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-sm ring-1 ring-border">
                        Save {discount}%
                    </span>
                )}
                {product.stock < 1 && (
                    <span className="absolute inset-x-3 bottom-3 rounded-md bg-background/90 px-2 py-1.5 text-center text-xs font-semibold text-muted-foreground shadow-sm ring-1 ring-border">
                        Out of stock
                    </span>
                )}
            </Link>

            <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            href={products.show(product.slug)}
                            className="block truncate text-sm font-medium hover:underline"
                        >
                            {product.name}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">
                            {product.category?.name}
                        </p>
                    </div>
                    <Price
                        priceCents={product.price_cents}
                        compareAtCents={product.compare_at_price_cents}
                    />
                </div>
                {almostGone && (
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        Only {product.stock} left
                    </p>
                )}
            </div>

            {showAddToCart && (
                <AddToCartButton
                    product={product}
                    variant="outline"
                    size="sm"
                    className="w-full"
                />
            )}
        </article>
    );
}
