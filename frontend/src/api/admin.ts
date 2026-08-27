import api from './axios'
import type {
  Order,
  PaginatedResponse,
} from '../types/api'

export async function getAdminOrders(): Promise<
  PaginatedResponse<Order>
> {
  const { data } =
    await api.get<PaginatedResponse<Order>>(
      '/admin/orders',
    )

  return data
}

export async function updateOrderStatus(
  orderId: number,
  status: string,
): Promise<Order> {
  const { data } =
    await api.patch<{ data: Order }>(
      `/admin/orders/${orderId}/status`,
      { status },
    )

  return data.data
}
