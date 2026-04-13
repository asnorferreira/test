import { apiRequest } from '@/lib/api-client'

export type Product = {
  id: string
  name: string
  slug: string
  description?: string | null
  basePrice: number // em reais
  isActive: boolean
}

export async function listProducts(activeOnly = true): Promise<Product[]> {
  return apiRequest<Product[]>('/products', {
    auth: false,
    query: { activeOnly },
  })
}

export async function getProduct(id: string): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`, { auth: false })
}

export function productPriceToCents(price: number): number {
  return Math.round(price * 100)
}
