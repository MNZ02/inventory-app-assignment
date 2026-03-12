import { beforeAll, describe, expect, it, mock } from 'bun:test'
import { Hono } from 'hono'

// Bypass auth in controller tests so requests reach product handlers.
mock.module('../middleware/auth', () => ({
  authMiddleware: async (_c: any, next: any) => {
    await next()
  },
}))

mock.module('../services/products.service', () => ({
  productsService: {
    findByBarcode: mock(),
    create: mock(),
    update: mock(),
    findAll: mock(),
    findById: mock(),
    delete: mock(),
  },
}))

describe('Products Controller - Barcode', () => {
  let app: Hono
  let productsService: any

  beforeAll(async () => {
    const { default: productRouter } = await import('../routes/products')
    const services = await import('../services/products.service')
    productsService = services.productsService
    app = new Hono().route('/products', productRouter)
  })

  it('GET /products/barcode/:barcode - returns product when found', async () => {
    const mockProduct = { id: '1', name: 'Test Product', barcode: '123456' }
    ;(productsService.findByBarcode as any).mockResolvedValue(mockProduct)

    const res = await app.request('/products/barcode/123456', {
      headers: { Authorization: 'Bearer mock-token' },
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toEqual(mockProduct)
  })

  it('GET /products/barcode/:barcode - returns 404 when not found', async () => {
    ;(productsService.findByBarcode as any).mockResolvedValue(null)

    const res = await app.request('/products/barcode/999', {
      headers: { Authorization: 'Bearer mock-token' },
    })

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Product not found')
  })

  it('POST /products - returns 400 when barcode already exists', async () => {
    const error: any = new Error('Unique constraint violation')
    error.code = '23505'
    error.detail = 'Key (barcode)=(123456) already exists.'
    ;(productsService.create as any).mockRejectedValue(error)

    const res = await app.request('/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token'
      },
      body: JSON.stringify({
        name: 'New Product',
        sku: 'SKU-001',
        barcode: '123456',
        category: 'Test',
        price: 10,
        quantityInStock: 5,
        supplierName: 'Supplier'
      }),
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Barcode already exists')
  })

  it('PUT /products/:id - returns 400 when updating to an existing barcode', async () => {
    const error: any = new Error('Unique constraint violation')
    error.code = '23505'
    error.detail = 'Key (barcode)=(123456) already exists.'
    ;(productsService.update as any).mockRejectedValue(error)

    const res = await app.request('/products/1', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token'
      },
      body: JSON.stringify({
        barcode: '123456'
      }),
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Barcode already exists')
  })
})
