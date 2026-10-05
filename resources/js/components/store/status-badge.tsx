import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

const styles: Record<OrderStatus, string> = {
    pending:
        'bg-amber-500/12 text-amber-700 ring-amber-500/30 dark:text-amber-300',
    paid: 'bg-sky-500/12 text-sky-700 ring-sky-500/30 dark:text-sky-300',
    processing:
        'bg-violet-500/12 text-violet-700 ring-violet-500/30 dark:text-violet-300',
    shipped:
        'bg-indigo-500/12 text-indigo-700 ring-indigo-500/30 dark:text-indigo-300',
    delivered:
        'bg-emerald-500/12 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300',
    cancelled:
        'bg-rose-500/12 text-rose-700 ring-rose-500/30 dark:text-rose-300',
};

type Props = {
    status: OrderStatus;
    className?: string;
};

export function StatusBadge({ status, className }: Props) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                styles[status] ?? styles.pending,
                className,
            )}
        >
            {labels[status] ?? status}
        </span>
    );
}

export { labels as statusLabels };
