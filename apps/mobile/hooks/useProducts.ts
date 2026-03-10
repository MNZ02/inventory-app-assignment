import { useState, useCallback, useEffect } from 'react'
import { api } from '../lib/api'
import type { Product, CreateProductInput, UpdateProductInput } from '@inventory/types'

interface UseProductsOptions {
  search?: string
  category?: string
  sortBy?: 'price' | 'quantity'
  order?: 'asc' | 'desc'
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (options.search) params.search = options.search
      if (options.category) params.category = options.category
      if (options.sortBy) params.sortBy = options.sortBy
      if (options.order) params.order = options.order

      const res = await api.get<Product[]>('/products', params)
      setProducts(res.data ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }, [options.search, options.category, options.sortBy, options.order])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const createProduct = useCallback(async (input: CreateProductInput) => {
    const res = await api.post<Product>('/products', input)
    if (!res.data) throw new Error(res.error ?? 'Failed to create product')
    await fetchProducts()
    return res.data
  }, [fetchProducts])

  const updateProduct = useCallback(async (id: string, input: UpdateProductInput) => {
    const res = await api.put<Product>(`/products/${id}`, input)
    if (!res.data) throw new Error(res.error ?? 'Failed to update product')
    await fetchProducts()
    return res.data
  }, [fetchProducts])

  const deleteProduct = useCallback(async (id: string) => {
    await api.delete(`/products/${id}`)
    await fetchProducts()
  }, [fetchProducts])

  return { products, isLoading, error, refetch: fetchProducts, createProduct, updateProduct, deleteProduct }
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<Product>(`/products/${id}`)
      setProduct(res.data ?? null)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to load product')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) fetchProduct()
  }, [fetchProduct])

  return { product, isLoading, error, refetch: fetchProduct }
}
