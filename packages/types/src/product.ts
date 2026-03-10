export interface Product {
  id: string
  name: string
  sku: string
  description?: string
  category: string
  price: number
  quantityInStock: number
  supplierName: string
  createdAt: string
}

export type CreateProductInput = Omit<Product, 'id' | 'createdAt'>
export type UpdateProductInput = Partial<CreateProductInput>
