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
  const image = getProductImage(product)

  const isOutOfStock = product.stock <= 0

  const addToCartMutation = useAddToCartMutation()

  const setCartDrawerOpen = useUIStore(
    (state) => state.setCartDrawerOpen,
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

  const isAdding = addToCartMutation.isPending

  return (
    <article className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:rounded-2xl">
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
            <div className="absolute left-2 top-2 rounded-full bg-neutral-950 px-2 py-0.5 text-[10px] font-semibold text-white sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs">
              Out of stock
            </div>
          )}
        </div>
      </Link>

      {/* Content – very compact on mobile so card stays square-ish */}
      <div className="p-2 sm:p-4">
        {/* Category – hide on mobile */}
        {product.category && (
          <p className="mb-0.5 hidden text-xs font-semibold uppercase tracking-wider text-neutral-400 sm:mb-1 sm:block">
            {product.category.name}
          </p>
        )}

        <Link
          to={`/products/${product.id}`}
          className="block"
        >
          <h2 className="line-clamp-2 text-xs font-semibold leading-4 text-neutral-900 transition-colors group-hover:text-neutral-600 sm:min-h-12 sm:text-base sm:leading-6">
            {product.name}
          </h2>
        </Link>

        <div className="mt-1.5 flex items-center justify-between gap-2 sm:mt-4 sm:gap-3">
          <p className="text-sm font-bold text-neutral-950 sm:text-lg">
            {formatPrice(product.price)}
          </p>

          {/* Cart button – completely hidden on mobile */}
          {!isOutOfStock && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              aria-label={`Add ${product.name} to cart`}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white transition-all hover:bg-neutral-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex"
            >
              {isAdding ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Stock text – hide on mobile */}
        <p className="mt-1 hidden items-center gap-1.5 text-xs text-neutral-500 sm:mt-2 sm:flex">
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
            className="mt-1 text-[10px] font-medium text-red-600 sm:mt-2 sm:text-xs"
          >
            Unable to add this item to your cart.
          </p>
        )}
      </div>
    </article>
  )
}