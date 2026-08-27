export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (params?: unknown) =>
      ['products', 'list', params] as const,
    detail: (id: number | string) =>
      ['products', 'detail', id] as const,
  },

  categories: {
    all: ['categories'] as const,
    list: (params?: unknown) =>
      ['categories', 'list', params] as const,
    detail: (id: number | string) =>
      ['categories', 'detail', id] as const,
  },

  cart: {
    all: ['cart'] as const,
  },

  orders: {
    all: ['orders'] as const,
    detail: (id: number | string) =>
      ['orders', 'detail', id] as const,
  },

  admin: {
    orders: ['admin', 'orders'] as const,
    products: ['admin', 'products'] as const,
    categories: ['admin', 'categories'] as const,
  },

  auth: {
    me: ['auth', 'me'] as const,
  },
} as const
