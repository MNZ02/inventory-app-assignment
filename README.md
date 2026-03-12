# Inventory Management System

A full-stack inventory management system built as a Turborepo monorepo with a Hono/Bun API backend and Expo React Native mobile app.

---

## Project Overview

Track products, manage stock levels, and record stock transactions (IN/OUT) with role-based access (admin/staff). The mobile app communicates with a REST API, authenticated via JWT.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18 |
| Bun | ≥ 1.0 |
| pnpm | ≥ 9.0 |
| PostgreSQL | ≥ 14 |
| Expo CLI | latest (`npm i -g expo-cli`) |

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd inventory-app
pnpm install
```

### 2. Configure environment variables

```bash
# API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your PostgreSQL credentials and a strong JWT_SECRET

# Mobile
cp apps/mobile/.env.example apps/mobile/.env
# Edit EXPO_PUBLIC_API_URL if your API runs on a different host/port
```

### 3. Run database migrations

```bash
cd apps/api
bun run db:generate   # generate SQL migration files from schema
bun run db:migrate    # apply migrations to the database
cd ../..
```

### 4. Start development servers

```bash
# From repo root — starts API + all apps simultaneously
pnpm dev

# Or run individually:
cd apps/api && bun run dev
cd apps/mobile && pnpm dev
# Optional: pnpm dev:lan | pnpm dev:localhost | pnpm dev:tunnel
```

The API runs at `http://localhost:3000`. Open the Expo app with Expo Go or a dev build.

---

## Completed Updates (March 12, 2026)

- **Expo Router v6 mobile shell**: authenticated tabs now include `Dashboard`, `Products`, and `Activity`.
- **System dark mode + manual theme toggle**: app follows device appearance and supports light/dark/system switching.
- **Barcode support end-to-end**:
  - `products.barcode` added in DB with unique constraint
  - new lookup endpoint `GET /products/barcode/:barcode`
  - scanner UI added for products list and product add/edit forms
  - supports EAN-13, EAN-8, UPC-A, UPC-E, and Code-128
  - scan-to-find opens product detail if found, otherwise offers prefilled Add Product
- **Image upload pipeline upgraded**: mobile uploads product images to Cloudinary using signed params; API stores HTTPS `imageUrl` only.
- **Base64 image migration support**: script added to migrate legacy `data:image/...` rows to hosted URLs.
- **Dashboard metrics expanded**:
  - `totalStockValue` (real `price * quantityInStock` aggregate)
  - stock flow as **net** movement (`IN - OUT`) for last 7 UTC days
  - safe zero-data handling (no BarChart crash path)
- **Products insights improved**: per-product dynamic trend badge (percent/units) and category filter UI.
- **Auth hardening**: mobile now clears token/user on API 401 and redirects to login via auth guard.
- **Inventory UX refinements**:
  - stock adjust modal is keyboard-aware on iOS/Android
  - after editing a product, user is redirected to Products tab
- **Detail freshness improvement**:
  - product detail refetches on screen focus to avoid stale data when navigating back through stack history
- **API test coverage additions**:
  - barcode lookup and barcode uniqueness controller behavior tests added (`bun:test`)
- **Repo hygiene updates**: `.expo/cache/**` ignored and tracked cache artifacts removed.

---

## API Documentation

All protected endpoints require `Authorization: Bearer <token>` header.

All responses follow the shape: `{ data, message?, error? }`

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register a new user, returns JWT |
| POST | `/auth/login` | No | Login with email/password, returns JWT |
| POST | `/auth/logout` | Yes | Logout current user session |

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | Yes | List all products. Query: `search`, `category`, `sortBy` (price\|quantity), `order` (asc\|desc). Search includes `name`, `sku`, `barcode`, and `supplierName` |
| GET | `/products/barcode/:barcode` | Yes | Lookup a product by exact barcode |
| GET | `/products/:id` | Yes | Get single product by ID |
| POST | `/products` | Yes | Create a new product |
| PUT | `/products/:id` | Yes | Update a product |
| DELETE | `/products/:id` | Yes | Delete a product |

### Transactions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/transactions` | Yes | List all transactions. Query: `productId` to filter |
| POST | `/transactions` | Yes | Record a stock IN or OUT transaction (atomic — updates stock, rejects OUT if insufficient) |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | Yes | Returns `{ totalProducts, totalStockQuantity, totalStockValue, lowStockItems, recentTransactions, stockFlow, stockFlowHasTransactions, stockFlowNetTotal }` |

### Upload

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/upload/sign` | Yes | Returns signed Cloudinary upload params for mobile image upload |

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check |

---

## Folder Structure

```
inventory-app/
├── turbo.json                   # Turborepo pipeline config
├── package.json                 # Root workspace (pnpm)
├── pnpm-workspace.yaml
│
├── apps/
│   ├── api/                     # Hono + Bun REST API
│   │   ├── src/
│   │   │   ├── index.ts         # Entry point (Bun.serve)
│   │   │   ├── routes/          # auth, products, transactions, dashboard
│   │   │   ├── middleware/      # JWT auth middleware (jose)
│   │   │   └── db/              # Drizzle schema, client, migrations
│   │   ├── drizzle.config.ts
│   │   └── .env.example
│   │
│   └── mobile/                  # Expo React Native app (Expo Router v6)
│       ├── app/
│       │   ├── _layout.tsx      # Root layout + auth guard
│       │   ├── (auth)/          # Login, Register screens
│       │   └── (app)/           # Authenticated shell
│       │       ├── (tabs)/      # Dashboard, Products, Activity tabs
│       │       └── products/    # Add/Edit/Detail stack screens
│       ├── components/ui/       # Button, Input, Card, Badge, LoadingSpinner
│       ├── hooks/               # useAuth, useProducts
│       ├── lib/                 # axios API client, expo-secure-store helpers
│       └── .env.example
│
└── packages/
    └── types/                   # Shared TypeScript interfaces (no build step)
        └── src/                 # auth.ts, product.ts, transaction.ts
```

---

## Key Design Decisions

- **JWT** signed with HS256 via `jose`, expires in 7 days. Payload: `{ sub, email, role }`
- **Stock transactions** run in a DB transaction — an OUT that would bring stock below 0 is rejected with HTTP 400
- **Low stock** threshold is `quantityInStock < 10`
- **Mobile** uses `expo-secure-store` for JWT persistence and auto-logs out on API 401
- **Barcode** is optional (`null`/missing allowed) but unique when present
- **Product images** are URL-only (`https://...`) and uploaded via Cloudinary signed flow (no base64 payload storage)
- **Dashboard stock flow** uses UTC day buckets and net units (`IN - OUT`)
- **Shared types** in `packages/types` are consumed as raw TypeScript source via path aliases — no build step needed

---

## Barcode Scanner Usage

### Prerequisites

1. API is running and connected to PostgreSQL.
2. Barcode migration is applied:

```bash
pnpm --filter @inventory/api db:migrate
```

3. Mobile app has camera permission granted.

Permission behavior:

- If camera permission is denied but can still be requested, tapping **Grant Permission** re-prompts.
- If camera permission is blocked by OS (`Don't ask again` / denied permanently), scanner shows **Open Settings** to enable camera manually.

### Scan to Find (Products Tab)

1. Open **Products** tab.
2. Tap the barcode icon in the header.
3. Scan a supported barcode.
4. If found, app opens product detail.
5. If not found, app shows prompt to open **Add Product** with prefilled barcode.

### Add/Edit Product with Scan

1. Open **Add Product** or **Edit Product**.
2. Tap barcode icon in the **Barcode (Optional)** field.
3. Scan a code.
4. Barcode field is filled from scanner output.
5. SKU is auto-filled only if SKU is currently empty.

### Supported Formats (v1)

- EAN-13
- EAN-8
- UPC-A
- UPC-E
- Code-128
