export interface Product {
  id: string
  name: string
  sku: string
  barcode?: string | null
  imageUrl?: string
  description?: string
  category: string
  price: number
  quantityInStock: number
  supplierName: string
  createdAt: string
  trend?: { kind: 'percent' | 'units'; value: number } | null
}

export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'trend'>
export type UpdateProductInput = Partial<CreateProductInput>
