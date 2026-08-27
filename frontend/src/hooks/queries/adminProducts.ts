import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createProduct,
  deleteProduct,
  getAdminCategories,
  getAdminProducts,
  updateProduct,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '../../api/adminProducts'

import {
  productQueryKeys,
  categoryQueryKeys,
} from './products'

import {
  createProductImage,
  deleteProductImage,
  getProductImages,
  type CreateProductImagePayload,
} from '../../api/adminProductImages'

export const adminProductQueryKeys = {
  all: ['admin-products'] as const,

  list: () =>
    [...adminProductQueryKeys.all, 'list'] as const,

  images: (productId: number) =>
    [...adminProductQueryKeys.all, 'images', productId] as const,
}

export const adminProductCategoryQueryKeys = {
  all: ['admin-product-categories'] as const,

  list: () =>
    [...adminProductCategoryQueryKeys.all, 'list'] as const,
}

export function useAdminProductsQuery() {
  return useQuery({
    queryKey: adminProductQueryKeys.list(),
    queryFn: () =>
      getAdminProducts({
        per_page: 100,
      }),
  })
}

export function useAdminProductCategoriesQuery() {
  return useQuery({
    queryKey: adminProductCategoryQueryKeys.list(),
    queryFn: getAdminCategories,
    staleTime: 5 * 60_000,
  })
}

export function useCreateAdminProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      createProduct(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminProductQueryKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: productQueryKeys.all,
      })
    },
  })
}

export function useUpdateAdminProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateProductPayload
    }) => updateProduct(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminProductQueryKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: productQueryKeys.all,
      })
    },
  })
}

export function useDeleteAdminProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      deleteProduct(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminProductQueryKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: productQueryKeys.all,
      })
    },
  })
}

export function useAdminProductImagesQuery(
  productId: number | null,
) {
  return useQuery({
    queryKey:
      productId !== null
        ? adminProductQueryKeys.images(productId)
        : [
            ...adminProductQueryKeys.all,
            'images',
            'missing',
          ],

    queryFn: () => {
      if (productId === null) {
        throw new Error('Product ID is missing.')
      }

      return getProductImages(productId)
    },

    enabled: productId !== null,
  })
}

export function useCreateAdminProductImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: number
      payload: CreateProductImagePayload
    }) =>
      createProductImage(productId, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminProductQueryKeys.images(
          variables.productId,
        ),
      })
    },
  })
}

export function useDeleteAdminProductImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: number
      imageId: number
    }) =>
      deleteProductImage(
        productId,
        imageId,
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminProductQueryKeys.images(
          variables.productId,
        ),
      })
    },
  })
}
