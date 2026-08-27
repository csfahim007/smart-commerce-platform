import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from '../../api/adminCategories'

import {
  categoryQueryKeys,
} from './products'

import {
  adminProductCategoryQueryKeys,
} from './adminProducts'

export const adminCategoryQueryKeys = {
  all: ['admin-categories'] as const,

  list: () =>
    [...adminCategoryQueryKeys.all, 'list'] as const,
}

export function useAdminCategoriesQuery() {
  return useQuery({
    queryKey: adminCategoryQueryKeys.list(),
    queryFn: getAdminCategories,
  })
}

export function useCreateAdminCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      createCategory(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminCategoryQueryKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: adminProductCategoryQueryKeys.all,
      })
    },
  })
}

export function useUpdateAdminCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateCategoryPayload
    }) => updateCategory(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminCategoryQueryKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: adminProductCategoryQueryKeys.all,
      })
    },
  })
}

export function useDeleteAdminCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      deleteCategory(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminCategoryQueryKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: adminProductCategoryQueryKeys.all,
      })
    },
  })
}
