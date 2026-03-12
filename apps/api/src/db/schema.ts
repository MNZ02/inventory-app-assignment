import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['admin', 'staff'])
export const transactionTypeEnum = pgEnum('transaction_type', ['IN', 'OUT'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('staff'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  sku: text('sku').notNull().unique(),
  barcode: text('barcode').unique(),
  description: text('description'),
  category: text('category').notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  quantityInStock: integer('quantity_in_stock').notNull().default(0),
  supplierName: text('supplier_name').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  quantityChange: integer('quantity_change').notNull(),
  type: transactionTypeEnum('type').notNull(),
  performedBy: uuid('performed_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
