# Mini-Etsy

A small Etsy-style storefront built as a **modular monolith**: one deployable
API with clear module boundaries, plus a web front end. Shoppers browse
handmade items by category, search by title, add items to a cart and check out
into an order.

All shops, products and people in the seed data are made up. There are no real
payments. Product photos are real, linked from [Unsplash](https://unsplash.com)
(see [Photography](#photography)).

| Part | Stack |
| --- | --- |
| API (`apps/api`) | NestJS 12, Prisma 7, SQLite, class-validator |
| Web (`apps/web`) | Next.js 16 (App Router, Cache Components), React 19, CSS Modules |
| Shared types (`packages/shared`) | TypeScript DTOs used by both apps |
| Tests | Vitest + Supertest (API), Vitest + React Testing Library (web) |

## Getting started

You need **Node.js 24 or newer** and npm. No database server is needed: SQLite
is a single file.

```bash
npm install        # installs every workspace and generates the Prisma client
npm run seed       # creates apps/api/dev.db and fills it with demo data
npm run dev        # API on http://localhost:4000, web on http://localhost:3000
```

Open http://localhost:3000.

Every setting has a localhost default, so no `.env` file is required. To
change one, copy `apps/api/.env.example` to `apps/api/.env`, or
`apps/web/.env.example` to `apps/web/.env.local`.

| Variable | App | Default |
| --- | --- | --- |
| `DATABASE_URL` | api | `file:./dev.db` (relative to `apps/api`) |
| `API_PORT` | api | `4000` |
| `WEB_ORIGIN` | api | `http://localhost:3000` (allowed by CORS) |
| `API_URL` | web | `http://localhost:4000` |

## Scripts

Run these from the repository root.

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the API (watch mode) and the web app together |
| `npm run seed` | Applies migrations and reseeds `dev.db`. It wipes existing data first, so it is safe to rerun |
| `npm test` | Runs every test: API unit, API e2e and web component tests |
| `npm run typecheck` | Type-checks every workspace |
| `npm run build` | Production build of the API and the web app |

`npm test` needs no database server and no browser. The API e2e tests create
their own `apps/api/test.db`, migrate it and seed it before each run, and never
touch `dev.db`.

## Architecture

```
apps/api/src/
  main.ts, app.module.ts
  shared/                   Money, Quantity, Slug, Result, DomainError, Entity,
                            the Prisma service and the TransactionRunner port
  modules/
    catalog/                categories and products
    cart/                   guest carts, kept by a cart_id cookie
    ordering/               checkout and the order status flow
      domain/               entities, value objects, repository interfaces
      application/          one class per use case, plus ports
      infrastructure/       Prisma repositories
      presentation/         controllers and request DTOs
      ordering.module.ts
      index.ts              the module's public API
```

Dependencies point inward: presentation and infrastructure depend on
application, application depends on domain, and domain depends only on
`shared/`. Domain code has no NestJS or Prisma imports, so it is tested with
plain unit tests.

Rules that keep the monolith modular:

- **A module exposes only what its `index.ts` exports.** Catalog exports
  `CatalogQueryService`, and Cart exports `CartQueryService`. No module imports
  another module's domain or infrastructure.
- **Modules do not share tables.** Each module's tables are prefixed
  (`catalog_`, `cart_`, `ordering_`) and there are no foreign keys between
  modules. Orders keep their own snapshot of each product's title and price.
- **Cross-module calls go through ports.** Ordering defines `ProductPricing`
  and `CartSource`, and Cart defines `ProductLookup`. Each port is bound to the
  other module's public service in the consuming module's `*.module.ts`, and
  the TypeScript compiler checks that the service fits the port.
- **One transaction across modules.** Checkout reads prices and stock,
  creates the order, lowers stock and clears the cart in one database
  transaction. It runs through the `TransactionRunner` port, which shares the
  open transaction with every repository through `AsyncLocalStorage`.

### Domain rules

- Money is stored as integer cents everywhere.
- `Quantity` is a whole number from 1 to 99. A cart line also cannot exceed
  the product's stock.
- Adding a product that is already in the cart merges into that line.
- The order status flow is enforced by the `Order` aggregate:

  ```
  Pending -> Paid -> Shipped -> Delivered
     |         |
     +---------+--> Cancelled
  ```

  Delivered and Cancelled are final. Any other move returns `409 Conflict`.
- Checkout rejects the whole order if any line is short on stock or no longer
  listed, and lists every problem in the error message.

### API

| Method and path | Purpose |
| --- | --- |
| `GET /categories` | Categories with active product counts |
| `GET /categories/:slug` | One category |
| `GET /products?category=&q=&sort=new\|price_asc\|price_desc&limit=` | Product list, search and filter |
| `GET /products/:slug` | Product detail |
| `GET /cart` | The current guest's cart (empty if there is no cookie) |
| `POST /cart/items` | Add `{ productId, quantity }`. Creates the cart and sets the `cart_id` cookie |
| `PATCH /cart/items/:productId` | Set `{ quantity }` |
| `DELETE /cart/items/:productId` | Remove a line |
| `POST /orders` | Check out the cart: `{ email, shippingName, shippingAddress }` |
| `GET /orders/:id` | Order summary and status |
| `PATCH /orders/:id/status` | Move an order to `{ status }`. Open in v1, since there are no accounts yet |

Domain errors map to HTTP status codes in one place,
`shared/infrastructure/domain-error.filter.ts`: validation errors return 400,
missing records 404, and conflicts such as short stock or a bad status move 409.

### Web

| Route | Shows |
| --- | --- |
| `/` | Category tiles and the newest products |
| `/c/[slug]` | Products in one category |
| `/p/[slug]` | Product detail with add-to-cart |
| `/search?q=` | Title search results |
| `/cart` | Cart lines, quantity edit, remove and subtotal |
| `/checkout` | Email and shipping form beside an order summary |
| `/orders/[id]` | Order summary and status tracker |

The web app reaches the API only through `apps/web/lib/api.ts`, which is
typed with `@mini-etsy/shared`. Server components call `API_URL` directly.
The browser calls `/api/*`, which `next.config.ts` rewrites to the API, so the
cart cookie belongs to the web app's own origin.

Pages render a static shell and stream API data inside `<Suspense>`, the
pattern Cache Components expects. The cart and checkout pages are client
components.

#### Design

The look borrows Windows 11's Fluent foundations and adds an editorial,
high-end layer on top:

- **Surfaces:** a warm Mica-like backdrop, translucent cards with soft
  elevation, and an acrylic (blurred) header, all with 8–18px rounded corners.
- **Controls:** Fluent-style accent, standard and subtle buttons, text fields
  with a darker bottom edge and an accent underline on focus, a NumberBox-style
  quantity stepper, and a segmented sort bar.
- **Type:** Segoe UI Variable (with Inter as the fallback off Windows) for the
  interface, and Cormorant Garamond for the logo, headings and prices.
- **Color:** deep spruce (`--accent`) with a brass detail (`--brass`). All
  tokens live at the top of `apps/web/app/globals.css`.

#### Photography

Product, collection and home-page photos are free-licence images from
[Unsplash](https://unsplash.com/license), **linked rather than copied**, so
the site needs an internet connection to show them. The seed stores each
photo's CDN URL (`imageUrl`) and its Unsplash page (`imageSourceUrl`), which
the product page links to as the credit. `apps/web/lib/image-loader.ts` tells
`next/image` to request each size straight from Unsplash's CDN. Orders keep a
snapshot of each line's photo, just as they keep the title and price.

## Tests

| Suite | Where | Covers |
| --- | --- | --- |
| Domain unit | `apps/api/src/**/*.spec.ts` | Money, Quantity, Slug, Result; Cart merge and stock limits; all 25 Order status pairs |
| Use case | `apps/api/src/modules/ordering/application/checkout.use-case.spec.ts` | Checkout with in-memory fakes: price snapshots, stock, cart clearing, short-stock rejection |
| API e2e | `apps/api/test/*.e2e-spec.ts` | List by category, search, cart add/merge/update/remove, checkout, fetch order, status flow |
| Web component | `apps/web/components/*.test.tsx` | Cart table totals, add-to-cart button states, checkout form validation |

Run one suite at a time:

```bash
npm run test:unit -w @mini-etsy/api
npm run test:e2e -w @mini-etsy/api
npm test -w @mini-etsy/web
```

## Adding a module

Each new module is a folder under `apps/api/src/modules/` with the same four
layers and an `index.ts`, added to `app.module.ts`. Existing modules change
only through their public `index.ts`.

| Next module | Adds | Touches |
| --- | --- | --- |
| Identity | Accounts, login, order history per user | Cart (attach to user), Ordering (customer id, and locking down status changes) |
| Shops | Seller shops, shop pages, seller-owned products | Catalog (`shopName` becomes `shopId`) |
| Payments | Payment intent and webhook through a provider's test mode | Ordering (Pending to Paid) |
| Reviews | Ratings and comments on delivered orders | Ordering (verify purchase), Catalog (average rating) |
| Inventory | Stock reservations that expire | Cart, Ordering, Catalog |
| Favorites | Saved items per user | Identity, Catalog |

When modules start reacting to each other (order paid, stock low), add an
in-process event bus such as `@nestjs/event-emitter` before reaching for a
message queue.

## Notes on tool versions

- **Vitest instead of Jest for the API.** NestJS 12 is ESM-only and its CLI now
  scaffolds projects with Vitest. Using Vitest for the API as well as the web
  app means one test runner across the repository.
- **Prisma 7 configuration.** The seed command is registered in
  `apps/api/prisma.config.ts` (`migrations.seed`). Prisma 7 replaced the older
  `"prisma": { "seed": ... }` key in package.json with this file. The client
  is generated into `apps/api/src/generated/` (git-ignored) on `npm install`.

## License

[MIT](LICENSE)
