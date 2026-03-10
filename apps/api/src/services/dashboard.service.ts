import { lt, eq, desc, sql } from 'drizzle-orm'
import { db } from '../db'
import { products, transactions, users, type Product as DbProduct } from '../db/schema'
import type { Product, Transaction } from '@inventory/types'

const toProduct = (row: DbProduct): Product => ({
  ...row,
  description: row.description || undefined,
  price: Number(row.price),
  createdAt: row.createdAt.toISOString(),
})

interface DashboardStats {
  totalProducts: number
  totalStockQuantity: number
  lowStockItems: Product[]
  recentTransactions: Transaction[]
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [{ totalProducts }] = await db
      .select({ totalProducts: sql<number>`count(*)::int` })
      .from(products)

    const [{ totalStockQuantity }] = await db
      .select({ totalStockQuantity: sql<number>`coalesce(sum(quantity_in_stock), 0)::int` })
      .from(products)

    const lowStockRows = await db
      .select()
      .from(products)
      .where(lt(products.quantityInStock, 10))
      .orderBy(products.quantityInStock)

    const recentTransactionRows = await db
      .select({
        id: transactions.id,
        productId: transactions.productId,
        productName: products.name,
        quantityChange: transactions.quantityChange,
        type: transactions.type,
        date: transactions.createdAt,
        performedBy: users.name,
      })
      .from(transactions)
      .innerJoin(products, eq(transactions.productId, products.id))
      .innerJoin(users, eq(transactions.performedBy, users.id))
      .orderBy(desc(transactions.createdAt))
      .limit(10)

    return {
      totalProducts,
      totalStockQuantity,
      lowStockItems: lowStockRows.map(toProduct),
      recentTransactions: recentTransactionRows.map((row) => ({
        ...row,
        date: row.date.toISOString(),
      })),
    }
  },
}
