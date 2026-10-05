import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/money';

type Props = {
    priceCents: number;
    compareAtCents?: number | null;
    size?: 'sm' | 'lg';
    className?: string;
    showSaleTag?: boolean;
};

export function Price({
    priceCents,
    compareAtCents,
    size = 'sm',
    className,
    showSaleTag = true,
}: Props) {
    const onSale =
        typeof compareAtCents === 'number' && compareAtCents > priceCents;
    const discount = onSale
        ? Math.round((1 - priceCents / compareAtCents) * 100)
        : 0;

    return (
        <span
            className={cn('flex flex-wrap items-baseline gap-x-2', className)}
        >
            <span
                className={cn(
                    'font-semibold tabular-nums',
                    size === 'lg' ? 'text-2xl' : 'text-sm',
                )}
            >
                {formatMoney(priceCents)}
            </span>
            {onSale && (
                <span className="text-xs text-muted-foreground tabular-nums line-through">
                    {formatMoney(compareAtCents)}
                </span>
            )}
            {onSale && showSaleTag && (
                <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                    −{discount}%
                </span>
            )}
        </span>
    );
}
