import api from './axios'
import type { Cart } from '../types/api'

export async function getCart(): Promise<Cart> {
  const { data } = await api.get('/cart')

  // Safely fallback if data is unwrapped or null
  const cart = data?.data ?? data

  return {
    ...cart,
    items: Array.isArray(cart?.items) ? cart.items : [],
  }
}

export async function addToCart(
  product_id: number,
  quantity: number,
): Promise<Cart> {
  const { data } = await api.post('/cart/items', {
    product_id,
    quantity,
  })

  const cart = data?.data ?? data

  return {
    ...cart,
    items: Array.isArray(cart?.items) ? cart.items : [],
  }
}

export async function updateCartItem(
  cartItemId: number,
  quantity: number,
): Promise<Cart> {
  const { data } = await api.put(
    `/cart/items/${cartItemId}`,
    { quantity },
  )

  const cart = data?.data ?? data

  return {
    ...cart,
    items: Array.isArray(cart?.items) ? cart.items : [],
  }
}

export async function removeCartItem(
  cartItemId: number,
): Promise<void> {
  await api.delete(`/cart/items/${cartItemId}`)
}