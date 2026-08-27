import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../../api/cart'

export const cartQueryKeys = {
  all: ['cart'] as const,

  current: () =>
    [...cartQueryKeys.all, 'current'] as const,
}

export function useCartQuery(
  enabled = true,
) {
  return useQuery({
    queryKey: cartQueryKeys.current(),
    queryFn: getCart,
    enabled,
  })
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: number
      quantity: number
    }) =>
      addToCart(
        productId,
        quantity,
      ),

    onSuccess: (cart) => {
      queryClient.setQueryData(
        cartQueryKeys.current(),
        cart,
      )
    },
  })
}

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      cartItemId,
      quantity,
    }: {
      cartItemId: number
      quantity: number
    }) =>
      updateCartItem(
        cartItemId,
        quantity,
      ),

    onSuccess: (cart) => {
      queryClient.setQueryData(
        cartQueryKeys.current(),
        cart,
      )
    },
  })
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cartItemId: number) =>
      removeCartItem(cartItemId),

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all,
      })
    },
  })
}
