# Inventory Management System — Technical Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Tech Stack](#3-tech-stack)
4. [Shared Types Package](#4-shared-types-package)
5. [Backend — API](#5-backend--api)
   - [Architecture](#51-architecture)
   - [Database Schema](#52-database-schema)
   - [Authentication](#53-authentication)
   - [API Endpoints](#54-api-endpoints)
   - [Service Layer](#55-service-layer)
6. [Mobile App](#6-mobile-app)
   - [Navigation & Auth Guard](#61-navigation--auth-guard)
   - [Screens](#62-screens)
   - [Hooks](#63-hooks)
   - [UI Components](#64-ui-components)
   - [API Client](#65-api-client)
7. [Type Sharing Architecture](#7-type-sharing-architecture)
8. [Development Setup](#8-development-setup)
9. [Environment Variables](#9-environment-variables)
10. [Git Workflow](#10-git-workflow)
11. [Assignment Checklist](#11-assignment-checklist)

---

## 1. Project Overview

A full-stack **Inventory Management System** that allows staff and admins to:

- Manage a product catalogue (create, read, update, delete)
- Track stock levels with stock-in and stock-out transactions
- View a dashboard with real-time stats and low-stock alerts
- Authenticate with role-based access (admin / staff)

The system is structured as a **pnpm Turborepo monorepo** containing a Hono/Bun REST API, an Expo React Native mobile app, and a shared TypeScript types package.

---

## 2. Monorepo Structure

```
inventory-app/
├── turbo.json                          # Turborepo pipeline (build, dev, lint, db:*)
├── package.json                        # Root workspace — pnpm
├── pnpm-workspace.yaml                 # Workspace globs: apps/*, packages/*
│
├── apps/
│   ├── api/                            # Hono + Bun REST API
│   │   ├── src/
│   │   │   ├── index.ts                # Bun.serve entry point
│   │   │   ├── routes/                 # Thin route files — delegates to controllers
│   │   │   │   ├── auth.ts
│   │   │   │   ├── products.ts
│   │   │   │   ├── transactions.ts
│   │   │   │   └── dashboard.ts
│   │   │   ├── controllers/            # Request/response handling + Zod validation
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── products.controller.ts
│   │   │   │   ├── transactions.controller.ts
│   │   │   │   └── dashboard.controller.ts
│   │   │   ├── services/               # Business logic + DB queries (typed with shared types)
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   ├── transactions.service.ts
│   │   │   │   └── dashboard.service.ts
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts             # JWT Bearer verification via jose
│   │   │   └── db/
│   │   │       ├── schema.ts           # Drizzle table definitions + inferred types
│   │   │       ├── index.ts            # Drizzle client (postgres-js)
│   │   │       └── migrations/         # Auto-generated SQL migrations
│   │   ├── drizzle.config.ts
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   └── mobile/                         # Expo React Native (Expo Router v3)
│       ├── app/
│       │   ├── _layout.tsx             # Root layout — AuthContext provider + auth guard
│       │   ├── (auth)/
│       │   │   ├── _layout.tsx
│       │   │   ├── login.tsx
│       │   │   └── register.tsx
│       │   └── (app)/
│       │       ├── _layout.tsx         # App shell with header styling
│       │       ├── dashboard.tsx
│       │       ├── products/
│       │       │   ├── index.tsx       # Product list with search + sort
│       │       │   ├── add.tsx
│       │       │   ├── [id].tsx        # Product detail + stock adjustment modal
│       │       │   └── edit/[id].tsx
│       │       └── transactions/
│       │           └── index.tsx
│       ├── components/ui/              # Reusable primitives
│       │   ├── Button.tsx
│       │   ├── Input.tsx
│       │   ├── Card.tsx
│       │   ├── Badge.tsx
│       │   └── LoadingSpinner.tsx
│       ├── hooks/
│       │   ├── useAuth.ts              # AuthContext, useAuthProvider, useAuth
│       │   └── useProducts.ts          # useProducts (list) + useProduct (single)
│       ├── lib/
│       │   ├── api.ts                  # Axios instance + JWT interceptor
│       │   └── storage.ts             # expo-secure-store helpers
│       ├── app.json
│       ├── tsconfig.json
│       └── .env.example
│
└── packages/
    └── types/                          # Shared TypeScript interfaces — no build step
        ├── src/
        │   ├── index.ts
        │   ├── auth.ts
        │   ├── product.ts
        │   └── transaction.ts
        └── package.json
```

---

## 3. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Monorepo | Turborepo + pnpm | Task caching, workspace linking |
| API runtime | Bun | Fast startup, native password hashing |
| API framework | Hono | Lightweight, typed middleware, Bun-native |
| Database | PostgreSQL | Relational, strong transaction support |
| ORM | Drizzle ORM | Type-safe queries, migrations via drizzle-kit |
| Auth | jose (HS256 JWT) | Standards-compliant, works in all runtimes |
| Validation | Zod | Runtime + TypeScript type inference |
| Mobile framework | Expo (React Native) | Managed workflow, file-based routing |
| Mobile routing | Expo Router v3 | File-system routing, typed routes |
| Forms | react-hook-form + zod | Performant forms with schema validation |
| HTTP client | Axios | Interceptors for JWT injection |
| Token storage | expo-secure-store | Encrypted native storage for JWT |

---

## 4. Shared Types Package

**Location:** `packages/types/src/`

The package exports pure TypeScript interfaces with **no build step**. Both the API and mobile app consume it directly via TypeScript path aliases.

### Path alias configuration

Both apps have this in their `tsconfig.json`:
```json
{
  "paths": {
    "@inventory/types": ["../../packages/types/src/index.ts"]
  }
}
```

And in their `package.json`:
```json
{
  "dependencies": {
    "@inventory/types": "workspace:*"
  }
}
```

### Exported types

**`auth.ts`**
```ts
User                  // { id, email, name, role }
AuthTokenPayload      // { sub, email, role } — JWT payload shape
LoginInput            // { email, password }
RegisterInput         // { name, email, password }
```

**`product.ts`**
```ts
Product               // Full product entity
CreateProductInput    // Omit<Product, 'id' | 'createdAt'>
UpdateProductInput    // Partial<CreateProductInput>
```

**`transaction.ts`**
```ts
TransactionType       // 'IN' | 'OUT'
Transaction           // Full transaction entity (includes productName, performedBy as strings)
CreateTransactionInput // Omit<Transaction, 'id' | 'date' | 'productName'>
```

---

## 5. Backend — API

### 5.1 Architecture

The API follows a three-layer pattern:

```
Route file  →  Controller  →  Service  →  Database (Drizzle)
```

- **Routes** (`src/routes/`) — mount middleware and delegate to controllers. Thin — no logic.
- **Controllers** (`src/controllers/`) — parse request, run Zod validation, call service, return HTTP response.
- **Services** (`src/services/`) — all business logic and database queries. Return typed objects matching `@inventory/types`.

### 5.2 Database Schema

Defined in `src/db/schema.ts` using Drizzle's `pgTable`.

#### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, `defaultRandom()` |
| name | text | |
| email | text | unique |
| passwordHash | text | Bun.password bcrypt |
| role | enum | `'admin' \| 'staff'`, default `'staff'` |
| createdAt | timestamp | `defaultNow()` |

#### `products`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| sku | text | unique |
| description | text | nullable |
| category | text | |
| price | numeric(12,2) | stored as string, converted to `number` in service layer |
| quantityInStock | integer | default 0 |
| supplierName | text | |
| createdAt | timestamp | |

#### `transactions`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| productId | uuid | FK → products (cascade delete) |
| quantityChange | integer | always positive |
| type | enum | `'IN' \| 'OUT'` |
| performedBy | uuid | FK → users |
| createdAt | timestamp | |

### 5.3 Authentication

- Passwords hashed with `Bun.password.hash()` (bcrypt internally)
- JWT signed with **HS256** via `jose`, expiry **7 days**
- Payload: `{ sub: userId, email, role }`
- `src/middleware/auth.ts` extracts the Bearer token, verifies with `jwtVerify`, and attaches the decoded payload to `c.set('user', payload)`

### 5.4 API Endpoints

All responses follow: `{ data, message?, error? }`

#### Auth (no JWT required)

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |

#### Products (JWT required)

| Method | Path | Query params | Body |
|---|---|---|---|
| GET | `/products` | `search`, `category`, `sortBy` (price\|quantity), `order` (asc\|desc) | — |
| GET | `/products/:id` | — | — |
| POST | `/products` | — | `CreateProductInput` |
| PUT | `/products/:id` | — | `UpdateProductInput` (partial) |
| DELETE | `/products/:id` | — | — |

#### Transactions (JWT required)

| Method | Path | Query params | Body |
|---|---|---|---|
| GET | `/transactions` | `productId` (optional filter) | — |
| POST | `/transactions` | — | `{ productId, quantityChange, type }` |

**Stock transaction rules:**
- Runs inside a **PostgreSQL transaction** with `FOR UPDATE` row lock
- `OUT` is rejected with HTTP 400 if `quantityInStock < quantityChange`
- On success, `products.quantityInStock` is atomically updated

#### Dashboard (JWT required)

| Method | Path | Response |
|---|---|---|
| GET | `/dashboard` | `{ totalProducts, totalStockQuantity, lowStockItems, recentTransactions }` |

- **Low stock** = `quantityInStock < 10`
- **Recent transactions** = last 10, joined with product name and user name

### 5.5 Service Layer

Key design decisions in the service layer:

**`products.service.ts`** — `toProduct()` mapper converts DB rows to the shared `Product` interface:
```ts
const toProduct = (row: DbProduct): Product => ({
  ...row,
  description: row.description || undefined,
  price: Number(row.price),          // numeric string → number
  createdAt: row.createdAt.toISOString(),  // Date → ISO string
})
```

Search uses `escapeLike()` to sanitize `%` and `_` characters before passing to `ilike`.

**`transactions.service.ts`** — `create()` returns a fully-shaped `Transaction` (with `productName` and `performedBy` as strings) by fetching related records inside the same DB transaction.

**`auth.service.ts`** — strips `passwordHash` and `createdAt` from the DB row before returning the `User` object.

---

## 6. Mobile App

### 6.1 Navigation & Auth Guard

Expo Router v3 file-based routing with two route groups:

```
(auth)/   — unauthenticated: login, register
(app)/    — authenticated: dashboard, products, transactions
```

`app/_layout.tsx` provides `AuthContext` and contains `AuthGuard`, which runs on every navigation:
- If **not authenticated** and not in `(auth)` → redirect to `/login`
- If **authenticated** and in `(auth)` → redirect to `/dashboard`

JWT expiry is checked locally on app load — expired tokens are removed from SecureStore automatically.

### 6.2 Screens

| Screen | Path | Description |
|---|---|---|
| Login | `(auth)/login` | Email/password form, error display |
| Register | `(auth)/register` | Name/email/password/confirm, zod match validation |
| Dashboard | `(app)/dashboard` | Stat cards + recent transactions FlatList |
| Product List | `(app)/products/index` | Search (debounced 400ms), sort cycle, FAB |
| Add Product | `(app)/products/add` | Full product form |
| Product Detail | `(app)/products/[id]` | Details, stock indicator, Stock In/Out modal, Edit/Delete |
| Edit Product | `(app)/products/edit/[id]` | Pre-filled form |
| Transactions | `(app)/transactions/index` | All transactions with IN/OUT badges |

### 6.3 Hooks

**`useAuth`** (`hooks/useAuth.ts`)
- Provides `AuthContext` with `user`, `isLoading`, `isAuthenticated`
- `login(email, password)` — calls API, saves token, sets user state
- `register(name, email, password)` — same
- `logout()` — removes token, clears state
- `useAuthProvider()` — used once in root layout to create the context value
- `useAuth()` — used by all children to read the context

**`useProducts`** (`hooks/useProducts.ts`)
- Accepts `{ search, category, sortBy, order }` options
- Re-fetches automatically when options change
- Exposes `createProduct`, `updateProduct`, `deleteProduct` mutations

**`useProduct`** (same file)
- Fetches a single product by ID
- Used on detail and edit screens

### 6.4 UI Components

All in `components/ui/`, built with standard React Native primitives:

| Component | Props | Notes |
|---|---|---|
| `Button` | `title, loading, variant (primary\|secondary\|danger)` | Disables during loading |
| `Input` | `label, error, ...TextInputProps` | Shows red border + error message |
| `Card` | `children, ...ViewProps` | Rounded, shadowed container |
| `Badge` | `label, variant (success\|danger\|warning\|info)` | Coloured pill label |
| `LoadingSpinner` | — | Full-screen centered `ActivityIndicator` |

### 6.5 API Client

`lib/api.ts` — Axios instance with:
- `baseURL` from `EXPO_PUBLIC_API_URL` env var (default `http://localhost:3000`)
- Request interceptor reads JWT from SecureStore and injects `Authorization: Bearer <token>` on every request

`lib/storage.ts` — thin wrappers over `expo-secure-store`:
```ts
saveToken(token)   // SecureStore.setItemAsync
getToken()         // SecureStore.getItemAsync
removeToken()      // SecureStore.deleteItemAsync
```

---

## 7. Type Sharing Architecture

```
packages/types/src/
        │
        ├── imported by apps/api/src/services/   (request input types, response types)
        │   ├── products.service.ts  ← CreateProductInput, UpdateProductInput, Product
        │   ├── auth.service.ts      ← User
        │   ├── transactions.service.ts ← Transaction
        │   └── dashboard.service.ts    ← Product, Transaction
        │
        └── imported by apps/mobile/
            ├── hooks/useAuth.ts        ← User
            ├── hooks/useProducts.ts    ← Product, CreateProductInput, UpdateProductInput
            └── screens                ← Product, Transaction
```

**No build step required.** TypeScript resolves source `.ts` files directly via path aliases in both `tsconfig.json` files. The `packages/types/package.json` points `main` and `types` at `./src/index.ts`.

---

## 8. Development Setup

### Prerequisites

- Node.js ≥ 18
- Bun ≥ 1.0
- pnpm ≥ 9.0
- PostgreSQL ≥ 14 running locally
- Expo CLI: `npm i -g expo-cli`

### Steps

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
# Edit apps/api/.env — set DATABASE_URL and JWT_SECRET

# 3. Generate and run database migrations
cd apps/api
bun run db:generate
bun run db:migrate
cd ../..

# 4. Start all dev servers (API + mobile with tunnel)
pnpm dev
```

The API starts on `http://localhost:3000`.
The mobile app starts with `--tunnel` (ngrok) — scan the QR code with Expo Go or a dev build on any device.

### Individual commands

```bash
# API only
cd apps/api && bun run dev

# Mobile only (tunnel)
cd apps/mobile && npx expo start --tunnel

# Re-generate migrations after schema changes
cd apps/api && bun run db:generate && bun run db:migrate
```

---

## 9. Environment Variables

### `apps/api/.env`

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/inventory` |
| `JWT_SECRET` | Secret key for HS256 signing | any long random string |
| `PORT` | API port (optional, default 3000) | `3000` |

### `apps/mobile/.env`

| Variable | Description | Example |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL of the API | `http://localhost:3000` |

> With tunnel mode enabled, update `EXPO_PUBLIC_API_URL` to point at the ngrok URL if testing on a physical device outside your local network — or rely on the tunnel URL displayed by Expo CLI.

---

## 10. Git Workflow

- **Repository:** `git@github.com:MNZ02/inventory-app-assignment.git`
- **Default branch:** `main` — initialised with a single README commit (clean base)
- **Feature branch:** `feat/inventory-management` — contains the full implementation (97 files, ~9,700 additions)
- A pull request from `feat/inventory-management` → `main` is open on GitHub showing the complete diff

### Branch history

```
main                  ← single "Initial commit" (README only)
  └── feat/inventory-management  ← full implementation commit
```

---

## 11. Assignment Checklist

> Last updated: 2026-03-10
> Legend: ✅ Done · ⚠️ Partial · ❌ Not done · 🎁 Bonus

### Authentication
| Requirement | Status | Notes |
|---|---|---|
| Register account | ✅ | `POST /auth/register`, Register screen with zod validation |
| Login | ✅ | `POST /auth/login`, Login screen |
| Logout | ✅ | Clears JWT from SecureStore, redirects to login |
| JWT authentication | ✅ | HS256 via jose, 7-day expiry, Bearer middleware on all protected routes |
| Admin / Staff roles | ✅ | `role` enum in DB, included in JWT payload |

### Product Management
| Requirement | Status | Notes |
|---|---|---|
| Add new products | ✅ | `POST /products` + Add Product screen |
| View product list | ✅ | `GET /products` + Products screen |
| View product details | ✅ | `GET /products/:id` + Product Detail screen |
| Update product | ✅ | `PUT /products/:id` + Edit Product screen (pre-filled form) |
| Delete product | ✅ | `DELETE /products/:id` + confirmation alert on Detail screen |
| Barcode scanning | 🎁 | Not implemented — bonus feature |
| Product Name field | ✅ | |
| SKU field | ✅ | Unique constraint in DB |
| Description field | ✅ | Optional |
| Category field | ✅ | |
| Price field | ✅ | Stored as `numeric`, returned as `number` |
| Quantity in Stock field | ✅ | |
| Supplier Name field | ✅ | |
| Created Date field | ✅ | Auto-set by DB |

### Inventory Tracking
| Requirement | Status | Notes |
|---|---|---|
| Increase stock (IN) | ✅ | Stock In button on Detail screen → `POST /transactions` with type IN |
| Decrease stock (OUT) | ✅ | Stock Out button → rejected if stock would go negative |
| Record inventory transactions | ✅ | Atomic DB transaction, updates `quantityInStock` |
| Transaction: Product | ✅ | `productId` FK + `productName` in response |
| Transaction: Quantity change | ✅ | |
| Transaction: Type (IN/OUT) | ✅ | |
| Transaction: Date | ✅ | `createdAt` → ISO string |
| Transaction: Performed by | ✅ | `performedBy` FK → user name in response |

### Dashboard
| Requirement | Status | Notes |
|---|---|---|
| Total number of products | ✅ | `GET /dashboard` → `totalProducts` |
| Total stock quantity | ✅ | `totalStockQuantity` |
| Low stock items | ✅ | `lowStockItems` — products where `quantityInStock < 10` |
| Recent transactions | ✅ | Last 10 transactions with product name + user name |

### Search and Filtering
| Requirement | Status | Notes |
|---|---|---|
| Search products by name | ✅ | `?search=` on `GET /products`, debounced in UI (400ms) |
| Filter by category | ⚠️ | API supports `?category=` but **Products screen has no category filter UI yet** |
| Sort by stock quantity | ✅ | `?sortBy=quantity&order=asc|desc` + UI sort cycle button |
| Sort by price | ✅ | `?sortBy=price&order=asc|desc` + UI sort cycle button |

### Frontend / UI
| Requirement | Status | Notes |
|---|---|---|
| React Native | ✅ | Expo managed workflow |
| Login screen | ✅ | |
| Register screen | ✅ | |
| Dashboard screen | ✅ | |
| Product List screen | ✅ | |
| Add Product screen | ✅ | |
| Edit Product screen | ✅ | |
| Product Details screen | ✅ | |
| Inventory Transactions screen | ✅ | |
| Clean and simple UI | ✅ | Consistent card-based layout, blue primary colour |
| Form validation | ✅ | react-hook-form + zod on all forms |
| Loading indicators | ✅ | `LoadingSpinner` + button loading states |
| Error messages | ✅ | Inline field errors + server error banners |
| Charts for analytics | 🎁 | Not implemented — optional |
| Dark mode | 🎁 | Not implemented — optional |

### Bonus Features
| Feature | Status | Notes |
|---|---|---|
| Product image upload | 🎁 | Not implemented |
| Low stock notifications | 🎁 | Not implemented |
| Export report (CSV/PDF) | 🎁 | Not implemented |
| Real-time updates (WebSockets) | 🎁 | Not implemented |

### Submission Requirements
| Item | Status | Notes |
|---|---|---|
| GitHub repository | ✅ | `git@github.com:MNZ02/inventory-app-assignment.git` |
| README with setup + API docs | ✅ | `README.md` at repo root |
| Technical documentation | ✅ | This file (`DOCUMENTATION.md`) |
| Screenshots | ❌ | Need to capture all screens once app is running |
| 3–5 minute demo video | ❌ | Not recorded yet |

---

### Outstanding items (priority order)

1. ⚠️ **Category filter UI** — add a category filter control to the Products screen (`apps/mobile/app/(app)/products/index.tsx`)
2. ❌ **Screenshots** — run the app, capture one screenshot per screen (~8 screens)
3. ❌ **Demo video** — 3–5 min walkthrough covering auth → products → stock adjustment → dashboard
4. 🎁 **Charts on dashboard** — easiest bonus, high visual impact (`react-native-gifted-charts`)
5. 🎁 **Barcode scanning** — `expo-camera` barcode scanner on Add/Edit Product screen
