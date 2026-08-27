import api from './axios'
import type { ProductAssistantResult } from '../types/api'

export async function askProductAssistant(
  message: string,
): Promise<ProductAssistantResult> {
  const { data } = await api.post<{
    data: ProductAssistantResult
  }>('/ai/product-assistant', {
    message,
  })

  return data.data
}
