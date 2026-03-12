import { eq, ilike, and, asc, desc, or, sql } from 'drizzle-orm'
import { db } from '../db'
import { products, transactions, type Product as DbProduct } from '../db/schema'
import type { CreateProductInput, UpdateProductInput, Product } from '@inventory/types'

export interface GetProductsParams {
  search?: string
  category?: string
  sortBy?: string
  order?: string
}

const toProduct = (row: DbProduct, trend?: { kind: 'percent' | 'units'; value: number } | null): Product => ({
  ...row,
  imageUrl: row.imageUrl ?? undefined,
  description: row.description ?? undefined,
  barcode: row.barcode,
  price: Number(row.price),
  createdAt: row.createdAt.toISOString(),
  trend: trend ?? undefined,
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
          ilike(products.barcode, `%${escaped}%`),
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
      .select({
        product: products,
        currentNet: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.createdAt} >= NOW() - INTERVAL '7 days' AND ${transactions.type} = 'IN' THEN ${transactions.quantityChange} WHEN ${transactions.createdAt} >= NOW() - INTERVAL '7 days' AND ${transactions.type} = 'OUT' THEN -${transactions.quantityChange} ELSE 0 END), 0)::int`,
        previousNet: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.createdAt} >= NOW() - INTERVAL '14 days' AND ${transactions.createdAt} < NOW() - INTERVAL '7 days' AND ${transactions.type} = 'IN' THEN ${transactions.quantityChange} WHEN ${transactions.createdAt} >= NOW() - INTERVAL '14 days' AND ${transactions.createdAt} < NOW() - INTERVAL '7 days' AND ${transactions.type} = 'OUT' THEN -${transactions.quantityChange} ELSE 0 END), 0)::int`,
      })
      .from(products)
      .leftJoin(transactions, eq(products.id, transactions.productId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(products.id)
      .orderBy(orderDir(orderCol))

    return rows.map(({ product, currentNet, previousNet }) => {
      let trend: { kind: 'percent' | 'units'; value: number } | null = null

      if (currentNet === 0 && previousNet === 0) {
        trend = null
      } else if (previousNet !== 0) {
        trend = {
          kind: 'percent',
          value: Math.round(((currentNet - previousNet) / Math.abs(previousNet)) * 100),
        }
      } else if (previousNet === 0 && currentNet !== 0) {
        trend = {
          kind: 'units',
          value: currentNet,
        }
      }

      return toProduct(product, trend)
    })
  },

  async findById(id: string): Promise<Product | null> {
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1)
    return product ? toProduct(product) : null
  },

  async findByBarcode(barcode: string): Promise<Product | null> {
    const [product] = await db.select().from(products).where(eq(products.barcode, barcode)).limit(1)
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
