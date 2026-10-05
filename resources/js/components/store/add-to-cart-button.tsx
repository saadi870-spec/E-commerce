import { Form } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';
import type { ReactNode } from 'react';
import CartController from '@/actions/App/Http/Controllers/Store/CartController';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

type Props = {
    product: Product;
    quantity?: number;
    children?: ReactNode;
    className?: string;
    variant?: React.ComponentProps<typeof Button>['variant'];
    size?: React.ComponentProps<typeof Button>['size'];
    withIcon?: boolean;
};

export function AddToCartButton({
    product,
    quantity = 1,
    children,
    className,
    variant = 'default',
    size = 'default',
    withIcon = true,
}: Props) {
    const outOfStock = product.stock < 1;

    return (
        <Form
            {...CartController.store.form()}
            options={{ preserveScroll: true }}
            className={cn('contents', className)}
        >
            {({ processing }) => (
                <>
                    <input type="hidden" name="product_id" value={product.id} />
                    <input type="hidden" name="quantity" value={quantity} />
                    <Button
                        type="submit"
                        variant={variant}
                        size={size}
                        disabled={outOfStock || processing}
                        className={className}
                    >
                        {processing ? <Spinner /> : withIcon && <ShoppingBag />}
                        {children ??
                            (outOfStock ? 'Out of stock' : 'Add to cart')}
                    </Button>
                </>
            )}
        </Form>
    );
}
