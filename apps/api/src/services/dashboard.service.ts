import { lt, eq, desc, gte, sql } from 'drizzle-orm'
import { db } from '../db'
import { products, transactions, users, type Product as DbProduct } from '../db/schema'
import type { Product, Transaction } from '@inventory/types'

const toProduct = (row: DbProduct): Product => ({
  ...row,
  imageUrl: row.imageUrl ?? undefined,
  description: row.description ?? undefined,
  price: Number(row.price),
  createdAt: row.createdAt.toISOString(),
})

interface DashboardStats {
  totalProducts: number
  totalStockQuantity: number
  totalStockValue: number
  lowStockItems: Product[]
  recentTransactions: Transaction[]
  stockFlow: { date: string; units: number }[]
  stockFlowHasTransactions: boolean
  stockFlowNetTotal: number
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [{ totalProducts }] = await db
      .select({ totalProducts: sql<number>`count(*)::int` })
      .from(products)

    const [{ totalStockQuantity }] = await db
      .select({ totalStockQuantity: sql<number>`coalesce(sum(quantity_in_stock), 0)::int` })
      .from(products)

    const [{ totalStockValue }] = await db
      .select({
        totalStockValue: sql<number>`coalesce(sum(${products.price} * ${products.quantityInStock}), 0)::double precision`,
      })
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

    // Calculate stock flow for the last 7 UTC calendar days.
    const now = new Date()
    const startOfTodayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const sevenDaysAgoUtc = new Date(startOfTodayUtc)
    sevenDaysAgoUtc.setUTCDate(startOfTodayUtc.getUTCDate() - 6)

    const recentFlowRows = await db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${transactions.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
        units: sql<number>`sum(case when ${transactions.type} = 'IN' then ${transactions.quantityChange} when ${transactions.type} = 'OUT' then -${transactions.quantityChange} else 0 end)::int`
      })
      .from(transactions)
      .where(gte(transactions.createdAt, sevenDaysAgoUtc))
      .groupBy(sql`date_trunc('day', ${transactions.createdAt} AT TIME ZONE 'UTC')`)
      .orderBy(sql`date_trunc('day', ${transactions.createdAt} AT TIME ZONE 'UTC')`)

    const flowMap = new Map(recentFlowRows.map((row) => [row.date, row.units]))

    const stockFlowHasTransactions = recentFlowRows.length > 0;
    const stockFlowNetTotal = recentFlowRows.reduce((sum, row) => sum + row.units, 0);

    const stockFlow = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfTodayUtc)
      d.setUTCDate(startOfTodayUtc.getUTCDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      return {
        date: dateStr,
        units: flowMap.get(dateStr) || 0,
      }
    })

    return {
      totalProducts,
      totalStockQuantity,
      totalStockValue,
      lowStockItems: lowStockRows.map(toProduct),
      recentTransactions: recentTransactionRows.map((row) => ({
        ...row,
        date: row.date.toISOString(),
      })),
      stockFlow,
      stockFlowHasTransactions,
      stockFlowNetTotal,
    }
  },
}
