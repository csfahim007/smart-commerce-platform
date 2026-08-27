import { useQuery } from '@tanstack/react-query'
import { getOrders, getOrder } from '../../api/orders'

export const orderQueryKeys = {
  all: ['orders'] as const,

  list: () =>
    [...orderQueryKeys.all, 'list'] as const,

  detail: (id: number | string) =>
    [...orderQueryKeys.all, 'detail', id] as const,
}

export function useOrdersQuery() {
  return useQuery({
    queryKey: orderQueryKeys.list(),
    queryFn: getOrders,
  })
}

export function useOrderQuery(id: number | string | undefined) {
  return useQuery({
    queryKey:
      id !== undefined
        ? orderQueryKeys.detail(id)
        : [...orderQueryKeys.all, 'detail', 'missing'],

    queryFn: () => {
      if (id === undefined) {
        throw new Error('Order ID is missing.')
      }

      return getOrder(id)
    },

    enabled: id !== undefined,
  })
}