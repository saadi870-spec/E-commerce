import type { User } from './auth';

export type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    position: number;
    products_count?: number;
};

export type ProductSpec = {
    label: string;
    value: string;
};

export type Product = {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    sku: string;
    tagline: string | null;
    description: string;
    specs: ProductSpec[] | null;
    price_cents: number;
    compare_at_price_cents: number | null;
    stock: number;
    accent_color: string;
    is_featured: boolean;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
    category?: Category | null;
};

export type CartLine = {
    product: Product;
    quantity: number;
    line_total_cents: number;
};

export type CartSummary = {
    count: number;
    subtotal_cents: number;
};

export type OrderTotals = {
    subtotal_cents: number;
    shipping_cents: number;
    tax_cents: number;
    total_cents: number;
};

export type OrderStatus =
    | 'pending'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';

export type OrderItem = {
    id: number;
    order_id: number;
    product_id: number | null;
    name: string;
    slug: string;
    price_cents: number;
    quantity: number;
    product?: Product | null;
};

export type Order = {
    id: number;
    number: string;
    user_id: number | null;
    status: OrderStatus;
    email: string;
    name: string;
    phone: string | null;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    payment_method: 'card' | 'cod';
    subtotal_cents: number;
    shipping_cents: number;
    tax_cents: number;
    total_cents: number;
    placed_at: string;
    created_at?: string;
    updated_at?: string;
    items?: OrderItem[];
    user?: { id: number; name: string; email: string } | null;
};

export type ShopInfo = {
    name: string;
    currency: string;
    taxRate: number;
    freeShippingOverCents: number;
    flatShippingCents: number;
    paymentMethods: Record<string, string>;
};

export type SharedProps = {
    name: string;
    shop: ShopInfo;
    auth: { user: User | null };
    cart: CartSummary;
    categories: Category[];
    sidebarOpen: boolean;
    [key: string]: unknown;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    first_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};
