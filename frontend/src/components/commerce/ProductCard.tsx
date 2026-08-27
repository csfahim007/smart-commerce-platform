import { Link } from 'react-router-dom'
import {
  Check,
  ShoppingCart,
} from 'lucide-react'

import {
  useAddToCartMutation,
} from '../../hooks/queries/cart'

import { useUIStore } from '../../stores/ui.store'

import type { Product } from '../../types/api'

interface ProductCardProps {
  product: Product
}

function getProductImage(
  product: Product,
): string | null {
  const primaryImage =
    product.images?.find(
      (image) => image.is_primary,
    )

  return (
    primaryImage?.image_url ||
    product.images?.[0]?.image_url ||
    null
  )
}

function formatPrice(
  price: string | number,
) {
  const numericPrice = Number(price)

  if (Number.isNaN(numericPrice)) {
    return String(price)
  }

  return `৳${numericPrice.toLocaleString(
    'en-BD',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const image =
    getProductImage(product)

  const isOutOfStock =
    product.stock <= 0

  const addToCartMutation =
    useAddToCartMutation()

  const setCartDrawerOpen =
    useUIStore(
      (state) =>
        state.setCartDrawerOpen,
    )

  function handleAddToCart() {
    if (isOutOfStock) {
      return
    }

    addToCartMutation.mutate(
      {
        productId: product.id,
        quantity: 1,
      },
      {
        onSuccess: () => {
          setCartDrawerOpen(true)
        },
      },
    )
  }

  const isAdding =
    addToCartMutation.isPending

  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <Link
        to={`/products/${product.id}`}
        className="block"
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              No image available
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute left-3 top-3 rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
              Out of stock
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.category && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {product.category.name}
          </p>
        )}

        <Link
          to={`/products/${product.id}`}
          className="block"
        >
          <h2 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-neutral-900 transition-colors group-hover:text-neutral-600">
            {product.name}
          </h2>
        </Link>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-neutral-950">
            {formatPrice(product.price)}
          </p>

          {!isOutOfStock && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              aria-label={`Add ${product.name} to cart`}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white transition-all hover:bg-neutral-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAdding ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
          {!isOutOfStock && (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          )}

          {isOutOfStock
            ? 'Currently unavailable'
            : `${product.stock} available`}
        </p>

        {addToCartMutation.isError && (
          <p
            role="alert"
            className="mt-2 text-xs font-medium text-red-600"
          >
            Unable to add this item to your cart.
          </p>
        )}
      </div>
    </article>
  )
}
