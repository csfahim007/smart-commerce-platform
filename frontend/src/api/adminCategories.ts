import api from './axios'
import type { Category, PaginatedResponse } from '../types/api'

export interface CreateCategoryPayload {
  name: string
  slug?: string
  description?: string
  is_active: boolean
  sort_order: number
}

export type UpdateCategoryPayload =
  Partial<CreateCategoryPayload>

export async function getAdminCategories(): Promise<Category[]> {
  const { data } =
    await api.get<PaginatedResponse<Category> | Category[]>(
      '/categories'
    )

  return Array.isArray(data)
    ? data
    : data.data
}

export async function createCategory(
  payload: CreateCategoryPayload
): Promise<Category> {
  const { data } =
    await api.post<{ data: Category }>(
      '/categories',
      payload
    )

  return data.data
}

export async function updateCategory(
  id: number,
  payload: UpdateCategoryPayload
): Promise<Category> {
  const { data } =
    await api.put<{ data: Category }>(
      `/categories/${id}`,
      payload
    )

  return data.data
}

export async function deleteCategory(
  id: number
): Promise<void> {
  await api.delete(`/categories/${id}`)
}
