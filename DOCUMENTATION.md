# Inventory Management System — Technical Documentation

## 1. Overview

This project is a pnpm Turborepo monorepo with:

- `apps/api`: Hono + Bun + Drizzle + PostgreSQL API
- `apps/mobile`: Expo SDK 54 React Native app using Expo Router v6
- `packages/types`: shared TypeScript domain types used by both API and mobile

Core capabilities implemented:

- JWT auth (register/login/logout) with role payload
- Product CRUD with search/sort/category filtering
- Product barcode support (optional unique barcode + scanner lookup)
- Inventory transactions (IN/OUT) with atomic stock updates
- Dashboard stats + recent transactions + stock flow chart
- Product image upload (Cloudinary signed upload flow)
- Dark mode/system theme support

## 2. Monorepo Structure

```txt
inventory-app/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── controllers/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── middleware/
│   │       └── db/
│   └── mobile/
│       ├── app/
│       │   ├── _layout.tsx
│       │   ├── (auth)/
│       │   └── (app)/
│       │       ├── _layout.tsx
│       │       ├── (tabs)/
│       │       │   ├── dashboard.tsx
│       │       │   ├── products/index.tsx
│       │       │   └── transactions/index.tsx
│       │       └── products/
│       │           ├── add.tsx
│       │           ├── [id].tsx
│       │           └── edit/[id].tsx
│       ├── components/ui/
│       ├── hooks/
│       └── lib/
└── packages/types/src/
```

## 3. Backend (API)

### 3.1 Architecture

Pattern: `route -> controller -> service -> DB`.

- Routes apply auth middleware for protected paths.
- Controllers validate input (Zod) and map errors to HTTP responses.
- Services hold query/business logic.

### 3.2 Database Schema (Drizzle)

- `users`: identity, role, password hash
- `products`: product catalog, SKU, optional unique barcode, price, quantity, optional image URL
- `transactions`: product stock movement (`IN`/`OUT`) with `performedBy`

### 3.3 Authentication

- JWT signed with HS256 (`jose`), 7-day expiration
- Auth middleware validates bearer token and attaches user payload
- Mobile also performs reactive logout on API `401` responses

### 3.4 Endpoints

#### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

#### Products (auth required)

- `GET /products` with query `search`, `category`, `sortBy`, `order`
- `GET /products/barcode/:barcode` (exact barcode lookup)
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`

Validation notes:

- `imageUrl` accepts optional HTTPS URL only
- non-URL/base64 data URIs are rejected
- `barcode` accepts `string | null` and is optional
- `barcode` must be unique when present (duplicate mapped to `Barcode already exists`)
- request body size limit middleware added on product routes

#### Transactions (auth required)

- `GET /transactions` (optional `productId` query)
- `POST /transactions` (`productId`, `quantityChange`, `type`)

Transaction behavior:

- wrapped in DB transaction
- row lock on product (`FOR UPDATE`)
- rejects `OUT` if stock is insufficient
- writes transaction and updates stock atomically

#### Dashboard (auth required)

- `GET /dashboard`

Current response includes:

- `totalProducts`
- `totalStockQuantity`
- `totalStockValue` (`sum(price * quantityInStock)`)
- `lowStockItems`
- `recentTransactions` (last 10)
- `stockFlow` (last 7 UTC days)
- `stockFlowHasTransactions`
- `stockFlowNetTotal`

Stock flow details:

- UTC day bucketing
- net daily units (`IN - OUT`)
- 7-day key backfill with zeroes for missing days

#### Upload (auth required)

- `GET /upload/sign`

Returns signed Cloudinary upload params (`timestamp`, `signature`, `cloudName`, `apiKey`, `folder`) for direct mobile upload.

### 3.5 Image Migration Script

`apps/api/src/scripts/migrate-images.ts` converts legacy base64 `imageUrl` values to hosted Cloudinary URLs.

## 4. Mobile App

### 4.1 Navigation

Expo Router v6 route groups:

- `(auth)` -> login/register
- `(app)` -> authenticated shell
- `(app)/(tabs)` -> Dashboard, Products, Activity (transactions)

Transactions screen is accessible from bottom tab bar as **Activity**.

### 4.2 Auth Guard and Session Handling

`app/_layout.tsx` redirects:

- unauthenticated users to `/(auth)/login`
- authenticated users away from auth routes

`useAuth` behavior:

- loads token from SecureStore at startup
- removes locally expired token
- response interceptor clears token + user on `401`

### 4.3 Products and Inventory Flow

- Products tab supports:
  - debounced search
  - stock-status filter pills
  - category pills derived from loaded products
  - barcode scan button in header for scan-to-find flow
- Product cards show dynamic trend badge when available (`percent` or `units`)
- Product detail supports stock adjustment modal (`IN` / `OUT`)
- Product detail refetches on focus to avoid stale data after navigation stack transitions
- Edit success redirects to Products tab

Barcode scanner flow:

- Scanner component uses `expo-camera` (`CameraView`) inside modal
- Currently supported barcode types: `ean13`, `ean8`, `upc_a`, `upc_e`, `code128`
- Permission states:
  - if `canAskAgain=true`, scanner can re-prompt with **Grant Permission**
  - if `canAskAgain=false`, scanner shows **Open Settings** fallback
- `Products` tab scan behavior:
  - barcode found => open product detail
  - barcode not found => prompt and route to Add Product with barcode prefilled
- Add/Edit forms:
  - barcode field supports manual input or scan
  - scanned value auto-fills SKU only when SKU is empty

### 4.4 Dashboard UX

- Recent transactions list is shown on dashboard
- Stock flow chart uses UTC label rendering to match API buckets
- All-zero chart case is guarded: renders fallback card instead of BarChart
- Net flow subtitle is dynamic (positive/negative/zero/no activity)

### 4.5 UI Components

- `LoadingSpinner`: animated loader, reusable full-screen state
- `Input`: now supports wrapper overrides (`containerClassName`) for cases like multiline height control
- Dark mode toggle available in tab headers

## 5. Shared Types

`packages/types` exports `User`, `Product`, `Transaction`, and input types.

Notable current fields:

- `Product.barcode?: string | null`
- `Product.trend?: { kind: 'percent' | 'units'; value: number } | null`

## 6. Environment Variables

### API (`apps/api/.env`)

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` (optional)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Mobile (`apps/mobile/.env`)

- `EXPO_PUBLIC_API_URL`

## 7. Development Notes

- Mobile scripts:
  - `pnpm dev`
  - `pnpm dev:lan`
  - `pnpm dev:localhost`
  - `pnpm dev:tunnel`
- Root and mobile gitignore now ignore Expo cache artifacts (`.expo/cache/**`).
- Barcode migration to apply before running latest API/mobile:
  - `apps/api/src/db/migrations/0002_yielding_the_stranger.sql`
  - adds `products.barcode` + unique constraint

### 7.1 Barcode API Tests

- `apps/api/src/controllers/products.controller.test.ts`
- Covered scenarios:
  - `GET /products/barcode/:barcode` returns product when found
  - returns `404` when not found
  - create/update duplicate barcode maps to HTTP `400` with `Barcode already exists`

### 7.2 Operational Troubleshooting

- PostgreSQL connectivity errors (`ETIMEDOUT` / `ECONNREFUSED` on `:5432`):
  - verify `DATABASE_URL`
  - verify DB firewall/security group and allowlist rules
  - verify network path (VPN/bastion/tunnel for private DBs)
- `column "barcode" does not exist`:
  - apply latest DB migration (`0002_yielding_the_stranger.sql`) via `pnpm --filter @inventory/api db:migrate`
- Scanner permission blocked:
  - when OS blocks re-prompt (`canAskAgain=false`), user must enable camera access from app settings

## 8. Requirement Coverage Snapshot

Implemented and verified:

- Inventory transactions screen in bottom tab navigation
- Stock IN/OUT operations with transaction records
- Required transaction fields (product, quantity, type, date, performedBy)
- Recent transactions on dashboard
- Atomic stock updates + insufficient-stock guard
