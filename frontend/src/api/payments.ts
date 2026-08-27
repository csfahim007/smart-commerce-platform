import api from './axios'

export interface CreatePaymentIntentResponse {
  client_secret: string
  payment_intent_id: string
}

export async function createPaymentIntent(
  orderId: number | string,
): Promise<CreatePaymentIntentResponse> {
  const { data } =
    await api.post<CreatePaymentIntentResponse>(
      `/orders/${orderId}/payment/intent`,
    )

  return data
}
