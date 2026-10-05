import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types';

type Props = {
    paginator: Paginated<unknown>;
    className?: string;
};

export function Pagination({ paginator, className }: Props) {
    if (paginator.last_page <= 1) {
        return null;
    }

    return (
        <nav
            className={cn(
                'flex flex-col items-center justify-between gap-4 sm:flex-row',
                className,
            )}
            aria-label="Pagination"
        >
            <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">
                    {paginator.from ?? 0}
                </span>{' '}
                –{' '}
                <span className="font-medium text-foreground">
                    {paginator.to ?? 0}
                </span>{' '}
                of{' '}
                <span className="font-medium text-foreground">
                    {paginator.total}
                </span>{' '}
                results
            </p>

            <div className="flex items-center gap-1">
                {paginator.links.map((link, index) =>
                    link.url ? (
                        <Link
                            key={index}
                            href={link.url}
                            className={cn(
                                'rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent',
                                link.active
                                    ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                                    : 'text-muted-foreground',
                            )}
                            aria-current={link.active ? 'page' : undefined}
                        >
                            <span
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        </Link>
                    ) : (
                        <span
                            key={index}
                            className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground/50"
                            aria-disabled="true"
                        >
                            <span
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        </span>
                    ),
                )}
            </div>
        </nav>
    );
}
