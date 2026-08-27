import api from './axios'
import type {
  Order,
  PaginatedResponse,
} from '../types/api'

export interface CreateOrderPayload {
  shipping_name?: string
  shipping_phone?: string
  shipping_address: string
  payment_method: string
}

export async function getOrders(): Promise<
  PaginatedResponse<Order>
> {
  const { data } =
    await api.get<PaginatedResponse<Order>>('/orders')

  return data
}

export async function getOrder(
  id: number | string,
): Promise<Order> {
  const { data } =
    await api.get<{ data: Order }>(`/orders/${id}`)

  return data.data
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<Order> {
  const { data } =
    await api.post<{ data: Order }>('/orders', payload)

  return data.data
}

export interface CreatePaymentIntentResponse {
  client_secret: string
  payment_intent_id: string
}

export async function createPaymentIntent(
  id: number | string,
): Promise<CreatePaymentIntentResponse> {
  const { data } =
    await api.post<CreatePaymentIntentResponse>(
      `/orders/${id}/payment/intent`,
    )

  return data
}