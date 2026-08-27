import api from './axios'
import type {
  Category,
  PaginatedResponse,
  Product,
} from '../types/api'

export interface ProductFilters {
  category_id?: number
  search?: string
  is_active?: boolean
  per_page?: number
  page?: number
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<PaginatedResponse<Product>>('/products', {
    params: filters,
  })

  return data
}

export async function getProduct(
  id: number | string,
): Promise<Product> {
  const { data } = await api.get<{ data: Product }>(
    `/products/${id}`,
  )

  return data.data
}



export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<PaginatedResponse<Category> | Category[]>(
    '/categories',
  )

  return Array.isArray(data) ? data : data.data
}