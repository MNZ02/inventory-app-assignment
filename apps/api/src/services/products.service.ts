import { eq, ilike, and, asc, desc, or } from 'drizzle-orm'
import { db } from '../db'
import { products, type Product as DbProduct } from '../db/schema'
import type { CreateProductInput, UpdateProductInput, Product } from '@inventory/types'

export interface GetProductsParams {
  search?: string
  category?: string
  sortBy?: string
  order?: string
}

const toProduct = (row: DbProduct): Product => ({
  ...row,
  description: row.description || undefined,
  price: Number(row.price),
  createdAt: row.createdAt.toISOString(),
})

const escapeLike = (str: string) => str.replace(/[\\%_]/g, (match) => `\\${match}`)

export const productsService = {
  async findAll({ search, category, sortBy, order }: GetProductsParams): Promise<Product[]> {
    const conditions = []
    if (search) {
      const escaped = escapeLike(search)
      conditions.push(
        or(
          ilike(products.name, `%${escaped}%`),
          ilike(products.sku, `%${escaped}%`),
          ilike(products.supplierName, `%${escaped}%`),
        ),
      )
    }
    if (category) {
      conditions.push(ilike(products.category, escapeLike(category)))
    }

    const orderDir = order === 'asc' ? asc : desc
    const orderCol =
      sortBy === 'quantity'
        ? products.quantityInStock
        : sortBy === 'price'
          ? products.price
          : products.createdAt

    const rows = await db
      .select()
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderDir(orderCol))

    return rows.map(toProduct)
  },

  async findById(id: string): Promise<Product | null> {
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1)
    return product ? toProduct(product) : null
  },

  async create(data: CreateProductInput): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        ...data,
        price: String(data.price),
      })
      .returning()
    return toProduct(product)
  },

  async update(id: string, data: UpdateProductInput): Promise<Product | null> {
    const values: Record<string, any> = { ...data }
    if (data.price !== undefined) {
      values.price = String(data.price)
    }

    const [product] = await db
      .update(products)
      .set(values)
      .where(eq(products.id, id))
      .returning()
    
    return product ? toProduct(product) : null
  },

  async delete(id: string): Promise<Product | null> {
    const [product] = await db.delete(products).where(eq(products.id, id)).returning()
    return product ? toProduct(product) : null
  },
}
