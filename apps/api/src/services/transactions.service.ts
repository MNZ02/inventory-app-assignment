import { eq, desc, sql } from 'drizzle-orm'
import { db } from '../db'
import { transactions, products, users } from '../db/schema'
import type { Transaction } from '@inventory/types'

export const transactionsService = {
  async findAll(productId?: string): Promise<Transaction[]> {
    const rows = await db
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
      .where(productId ? eq(transactions.productId, productId) : undefined)
      .orderBy(desc(transactions.createdAt))

    return rows.map((row) => ({
      ...row,
      date: row.date.toISOString(),
    }))
  },

  async create(productId: string, quantityChange: number, type: 'IN' | 'OUT', userId: string) {
    return await db.transaction(async (tx) => {
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .for('update')
        .limit(1)

      if (!product) {
        throw new Error('PRODUCT_NOT_FOUND')
      }

      if (type === 'OUT' && product.quantityInStock < quantityChange) {
        throw new Error('INSUFFICIENT_STOCK')
      }

      const delta = type === 'IN' ? quantityChange : -quantityChange

      await tx
        .update(products)
        .set({ quantityInStock: sql`${products.quantityInStock} + ${delta}` })
        .where(eq(products.id, productId))

      const [inserted] = await tx
        .insert(transactions)
        .values({ productId, quantityChange, type, performedBy: userId })
        .returning()

      return inserted
    })
  },
}
