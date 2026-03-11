import { Context } from 'hono'
import { z } from 'zod'
import { productsService } from '../services/products.service'

export const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  price: z.number().positive(),
  quantityInStock: z.number().int().min(0),
  supplierName: z.string().min(1),
  imageUrl: z
    .string()
    .url()
    .refine((url) => url.startsWith('https://'), {
      message: 'Must be an HTTPS URL',
    })
    .optional(),
})

export const productsController = {
  async getAll(c: Context) {
    const params = c.req.query()
    const rows = await productsService.findAll(params)
    return c.json({ data: rows })
  },

  async getById(c: Context) {
    const id = c.req.param('id') as string
    const product = await productsService.findById(id)
    if (!product) {
      return c.json({ data: null, error: 'Product not found' }, 404)
    }
    return c.json({ data: product })
  },

  async create(c: Context) {
    const body = await c.req.json().catch(() => null)
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      console.error('Product creation validation failed:', parsed.error.flatten())
      return c.json({ data: null, error: parsed.error.flatten() }, 400)
    }

    try {
      const product = await productsService.create(parsed.data)
      return c.json({ data: product, message: 'Product created' }, 201)
    } catch (err: any) {
      if (err?.code === '23505') {
        return c.json({ data: null, error: 'SKU already exists' }, 400)
      }
      return c.json({ data: null, error: 'Internal server error' }, 500)
    }
  },

  async update(c: Context) {
    const id = c.req.param('id') as string
    const body = await c.req.json().catch(() => null)
    const parsed = productSchema.partial().safeParse(body)
    if (!parsed.success) {
      console.error('Product update validation failed:', parsed.error.flatten())
      return c.json({ data: null, error: parsed.error.flatten() }, 400)
    }

    const product = await productsService.update(id, parsed.data)
    if (!product) {
      return c.json({ data: null, error: 'Product not found' }, 404)
    }
    return c.json({ data: product, message: 'Product updated' })
  },

  async delete(c: Context) {
    const id = c.req.param('id') as string
    const product = await productsService.delete(id)
    if (!product) {
      return c.json({ data: null, error: 'Product not found' }, 404)
    }
    return c.json({ data: null, message: 'Product deleted' })
  },
}
