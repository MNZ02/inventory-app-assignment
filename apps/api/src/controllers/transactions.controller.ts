import { Context } from 'hono'
import { z } from 'zod'
import { transactionsService } from '../services/transactions.service'
import type { AuthTokenPayload } from '@inventory/types'

export const createTransactionSchema = z.object({
  productId: z.string().uuid(),
  quantityChange: z.number().int().positive(),
  type: z.enum(['IN', 'OUT']),
})

export const transactionsController = {
  async getAll(c: Context) {
    const { productId } = c.req.query()
    const rows = await transactionsService.findAll(productId)
    return c.json({ data: rows })
  },

  async create(c: Context) {
    const body = await c.req.json().catch(() => null)
    const parsed = createTransactionSchema.safeParse(body)
    if (!parsed.success) {
      return c.json({ data: null, error: parsed.error.flatten() }, 400)
    }

    const { productId, quantityChange, type } = parsed.data
    const currentUser = c.get('user') as AuthTokenPayload

    try {
      const transaction = await transactionsService.create(productId, quantityChange, type, currentUser.sub)
      return c.json({ data: transaction, message: 'Transaction recorded' }, 201)
    } catch (err: any) {
      if (err.message === 'PRODUCT_NOT_FOUND') {
        return c.json({ data: null, error: 'Product not found' }, 404)
      }
      if (err.message === 'INSUFFICIENT_STOCK') {
        return c.json({ data: null, error: 'Insufficient stock for OUT transaction' }, 400)
      }
      return c.json({ data: null, error: 'Internal server error' }, 500)
    }
  },
}
