import { lt, eq, desc, gt, sql } from 'drizzle-orm'
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
  stockFlow: { date: string; units: number }[]
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

    // Calculate stock flow for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentFlowRows = await db
      .select({
        date: sql<Date>`date_trunc('day', ${transactions.createdAt})`,
        units: sql<number>`sum(case when ${transactions.type} = 'IN' then ${transactions.quantityChange} else 0 end)::int`
      })
      .from(transactions)
      .where(gt(transactions.createdAt, sevenDaysAgo))
      .groupBy(sql`date_trunc('day', ${transactions.createdAt})`)
      .orderBy(sql`date_trunc('day', ${transactions.createdAt})`);

    const flowMap = new Map(recentFlowRows.map(row => [row.date.toISOString().split('T')[0], row.units]));

    const stockFlow = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      return {
        date: dateStr,
        units: flowMap.get(dateStr) || 0
      };
    });

    return {
      totalProducts,
      totalStockQuantity,
      lowStockItems: lowStockRows.map(toProduct),
      recentTransactions: recentTransactionRows.map((row) => ({
        ...row,
        date: row.date.toISOString(),
      })),
      stockFlow,
    }
  },
}
