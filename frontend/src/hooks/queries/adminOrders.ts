import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  getAdminOrders,
  updateOrderStatus,
} from '../../api/admin'

export const adminOrderQueryKeys = {
  all: ['admin-orders'] as const,

  list: () =>
    [...adminOrderQueryKeys.all, 'list'] as const,
}

export function useAdminOrdersQuery() {
  return useQuery({
    queryKey: adminOrderQueryKeys.list(),
    queryFn: getAdminOrders,
  })
}

export function useUpdateAdminOrderStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: number
      status: string
    }) =>
      updateOrderStatus(orderId, status),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminOrderQueryKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: ['orders'],
      })
    },
  })
}
