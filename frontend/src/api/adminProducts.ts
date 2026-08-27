import api from './axios'
import type {
  Category,
  PaginatedResponse,
  Product,
} from '../types/api'

export interface CreateProductPayload {
  category_id: number
  name: string
  slug?: string
  sku: string
  description?: string
  price: string
  stock: number
  is_active: boolean
}

export type UpdateProductPayload =
  Partial<CreateProductPayload>

export async function getAdminProducts(
  params: {
    search?: string
    category_id?: number
    is_active?: boolean
    page?: number
    per_page?: number
  } = {},
): Promise<PaginatedResponse<Product>> {
  const { data } =
    await api.get<PaginatedResponse<Product>>(
      '/products',
      { params },
    )

  return data
}

export async function getAdminCategories(): Promise<
  Category[]
> {
  const { data } =
    await api.get<
      PaginatedResponse<Category> | Category[]
    >('/categories')

  return Array.isArray(data)
    ? data
    : data.data
}

export async function createProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  const { data } =
    await api.post<{ data: Product }>(
      '/products',
      payload,
    )

  return data.data
}

export async function updateProduct(
  id: number,
  payload: UpdateProductPayload,
): Promise<Product> {
  const { data } =
    await api.put<{ data: Product }>(
      `/products/${id}`,
      payload,
    )

  return data.data
}

export async function deleteProduct(
  id: number,
): Promise<void> {
  await api.delete(`/products/${id}`)
}
