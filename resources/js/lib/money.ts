const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

/**
 * Format an integer amount of cents as a currency string, e.g. 12900 → "$129.00".
 */
export function formatMoney(cents: number): string {
    return formatter.format(cents / 100);
}

/**
 * Convert cents back into a plain dollar string for form inputs.
 */
export function toDollars(cents: number | null | undefined): string {
    if (cents === null || cents === undefined) {
        return '';
    }

    return (cents / 100).toFixed(2);
}

/**
 * Format a date (ISO string or Date) for display, e.g. "Oct 2, 2026".
 */
export function formatDate(value: string | Date | null | undefined): string {
    if (!value) {
        return '';
    }

    const date = typeof value === 'string' ? new Date(value) : value;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Format a date with time, e.g. "Oct 2, 2026, 9:41 AM".
 */
export function formatDateTime(
    value: string | Date | null | undefined,
): string {
    if (!value) {
        return '';
    }

    const date = typeof value === 'string' ? new Date(value) : value;

    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
