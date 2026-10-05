import { cn } from '@/lib/utils';
import type { Product } from '@/types';

type Props = {
    product: Product;
    className?: string;
    /** Hide the decorative monogram — used for small thumbnails. */
    compact?: boolean;
};

/**
 * Deterministic artwork for a product. The store has no photography yet, so
 * each product gets a composed gradient built from its accent color instead
 * of a broken image.
 */
export function ProductImage({ product, className, compact = false }: Props) {
    const accent = product.accent_color || '#3f3f46';
    const initial = product.name.trim().charAt(0).toUpperCase();

    return (
        <div
            className={cn(
                'relative aspect-[4/5] overflow-hidden rounded-xl border border-border/60',
                className,
            )}
            style={{
                backgroundColor: `${accent}14`,
                backgroundImage: [
                    `radial-gradient(at 18% 12%, ${accent}59 0px, transparent 55%)`,
                    `radial-gradient(at 88% 82%, ${accent}4d 0px, transparent 50%)`,
                    `linear-gradient(155deg, ${accent}1f 0%, transparent 65%)`,
                ].join(', '),
            }}
            aria-hidden="true"
        >
            <div
                className="absolute inset-0 opacity-25 dark:opacity-20"
                style={{
                    color: accent,
                    backgroundImage:
                        'repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 12px)',
                }}
            />
            <span
                className={`absolute top-3 left-4 text-[10px] font-semibold tracking-[0.2em] text-foreground/50 uppercase ${compact ? 'hidden' : ''}`}
            >
                {product.category?.name ?? 'Meridian'}
            </span>
            <span
                className={`absolute right-4 bottom-1 text-6xl leading-none font-semibold text-foreground/10 select-none ${compact ? 'hidden' : ''}`}
            >
                {initial}
            </span>
        </div>
    );
}
