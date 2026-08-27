import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query'

import {
  getCategories,
  getProducts,
  getProduct,
  type ProductFilters,
} from '../../api/products'

export const productQueryKeys = {
  all: ['products'] as const,

  list: (filters: ProductFilters) =>
    [...productQueryKeys.all, 'list', filters] as const,

  detail: (id: number | string) =>
    [...productQueryKeys.all, 'detail', id] as const,
}

export const categoryQueryKeys = {
  all: ['categories'] as const,

  list: () =>
    [...categoryQueryKeys.all, 'list'] as const,
}

export function useProductsQuery(
  filters: ProductFilters = {},
) {
  return useQuery({
    queryKey: productQueryKeys.list(filters),
    queryFn: () => getProducts(filters),

    placeholderData: keepPreviousData,
  })
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoryQueryKeys.list(),
    queryFn: getCategories,

    staleTime: 5 * 60_000,
  })
}

export function useProductQuery(
  id: number | string | undefined,
) {
  return useQuery({
    queryKey:
      id !== undefined
        ? productQueryKeys.detail(id)
        : [...productQueryKeys.all, 'detail', 'missing'],

    queryFn: () => {
      if (id === undefined) {
        throw new Error('Product ID is missing.')
      }

      return getProduct(id)
    },

    enabled: id !== undefined,
  })
}