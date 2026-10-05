# Meridian Supply Co.

A professional, full-stack e-commerce storefront built with **Laravel 13.34.0**
and **React 19 (Inertia)**. It combines a Laravel admin area with a
storefront customers can browse, add to cart, and checkout from.

---

## Features

### Storefront
- **Categories** – browse products by category.
- **Product detail** – per-product page with spec rows.
- **Shopping cart** – persisted in the session; subtotal, tax (8%), and
  shipping (flat or free over a threshold) computed server-side.
- **Checkout** – guest or authenticated checkout; orders are given a
  `MER-2610-XXXXXX` order number.
- **Orders** – order history accessible from the storefront.

### Admin
- **Dashboard** – key metrics, a 14-day revenue series, recent orders, and
  quick actions for low-stock and top products.
- **Orders** – list with search/filter/pagination, full order view (line
  items, coupons, payments), and status transitions with stock
  decrement/increment and status reopen/reserve.
- **Products** – full CRUD with spec rows; automatic stock updates on
  cancel/reopen.

### Backend
- **Services**: `Cart` (session cart) and `Pricing` (cents math).
- **Models**: `Category`, `Product`, `Order`, `OrderItem`, `User` with
  scopes, casts, and factories.
- **Config**: `config/shop.php` (currency, 8% tax, shipping rules, payment
  methods, order statuses).
- **Routes**: `web`, `store`, `admin`, `settings`.

---

## Tech Stack

| Layer            | Technology                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| Backend          | PHP 8.5, Laravel 13.34.0                                                 |
| Frontend         | React 19, TypeScript, Inertia 2                                           |
| Styling          | Tailwind CSS v4, Radix UI                                                 |
| Asset build      | Vite Plus (`vp`) + Wayfinder JS routes                                   |
| Testing          | PestPHP (via PHPUnit 13)                                                 |
| Quality          | PHPStan, Pint, `tsc --noEmit`, Vite Plus format/lint                     |
| Auth             | Laravel Jetstream + Fortify (login, register, password reset, 2FA)       |

---

## Getting Started

### Prerequisites

- PHP 8.5
- Composer
- Node 20+ / pnpm
- A database (SQLite is used for tests; MySQL/PostgreSQL via `.env`)

### Install

```bash
composer install
npm i        # or: pnpm i
```

### Configure

```bash
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

### Run

```bash
php artisan serve            # http://localhost:8000
npm run dev                # HMR + Vite
```

### Seed Data

| Role      | Email                |
| --------- | -------------------- |
| Admin     | `admin@example.com`  |
| Shopper   | `test@example.com`   |

The seeder also creates 5 categories, 30 products, and 12 demo orders.

---

## Project Structure

### Backend

```
app/
  Http/Controllers/
    Admin/     # Dashboard, Order, Product, Order/Show, Product/Form
    Store/     # Home, Cart, Checkout, Order, Product
    Controller.php
    Middleware/
      EnsureUserIsAdmin.php
      HandleInertiaRequests.php
  Models/
    Category.php, Product.php, Order.php, OrderItem.php, User.php
  Services/
    Cart.php, Pricing.php
  Http/Requests/Store/ and Admin/ProductRequest.php
config/
  shop.php
routes/
  web.php, store.php, admin.php, settings.php
database/
  migrations/2026_10_02_*.php
  seeders/StoreSeeder.php, DatabaseSeeder.php
```

### Frontend

```
resources/js/
  types/shop.ts + index.ts
  lib/money.ts
  components/store/           # shared storefront components
  pages/store/               # Home, Catalog, Product, Cart, Checkout, Orders
  pages/admin/               # Dashboard, Orders (list + show), Products (list + form)
  layouts/storefront-layout.tsx
  app.tsx
  routes/                    # Inertia route definitions (products, cart, orders, checkout, admin, ...)
  actions/App/Http/Controllers/   # Inertia actions mirroring the backend
```

---

## Testing & Quality Gates

### Tests

```bash
php artisan test
```

Run time-out: PHPUnit 13.3.6. Seeded SQLite (`phpunit.xml`) is in memory.
62 tests pass, 4 skipped, 381 assertions.

Key coverage:
- **CheckoutTest** – guest places an order.
- **AdminAreaTest** – admin orders CRUD, status transitions, stock
  adjustments (cancel → decrement, reopen → increment), spec round-trips.
- **CatalogTest / CartTest / CheckoutTest / OrdersTest** – storefront flow.

### Quality

```bash
./vendor/bin/pint --test        # coding style
./vendor/bin/phpstan analyse    # static analysis
npx tsc --noEmit               # TypeScript check
npm run check                   # Vite Plus format + lint
npm run build                   # production build
```

---

## Architecture Notes

### Integer cents math
All money uses integer cents (`subtotal`, `shipping`, `tax`, `total`) and
`Money`/cents-aware `Pricing` helpers. Never store or compare floats for
money.

### Order number
`Order::generateNumber()` = `now()->format('ym')` + 6 random uppercase
characters, e.g. `MER-2610-XXXXXX`. The regex that validates it must match
this format exactly.

### Route keys
`Order::getRouteKeyName()` returns `'number'`, so Inertia routes resolve by
order number rather than primary key.

### `Product::purchasableQuantity()`
Returns the purchasable stock count as an `int` (never null), so the
frontend can safely call `> 0` and disable out-of-stock products.

### Configuration
All storefront settings (currency, tax, shipping, payments, order statuses)
live in `config/shop.php` and are shared into the Inertia app via
`HandleInertiaRequests`.

---

## Admin Walkthrough

1. Visit `http://localhost:8000/admin` and log in with the **admin**
   credentials (`admin@example.com`).
2. **Dashboard** – overview stats, revenue series, quick fixes.
3. **Orders** – search, filter, paginate; open an order to change status or
   view line items.
4. **Products** – create/edit a product; add spec rows; manage stock.
