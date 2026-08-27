import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2, Loader2 } from 'lucide-react'

import {
  useCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '../../hooks/queries/cart'
import { useUIStore } from '../../stores/ui.store'
import type { CartItem } from '../../types/api'

function formatPrice(price: string | number) {
  const numericPrice = Number(price)

  if (Number.isNaN(numericPrice)) {
    return String(price)
  }

  return `৳${numericPrice.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function getProductImage(item: CartItem): string | null {
  const primary = item.product?.images?.find(
    (image) => image.is_primary,
  )

  return (
    primary?.image_url ||
    item.product?.images?.[0]?.image_url ||
    null
  )
}

/* Individual Item Row with Local State & Debounced Mutations */
function CartDrawerItemRow({
  item,
  onUpdate,
  onRemove,
  isRemoving,
}: {
  item: CartItem
  onUpdate: (itemId: number, quantity: number) => void
  onRemove: (itemId: number) => void
  isRemoving: boolean
}) {
  const image = getProductImage(item)
  const productName = item.product?.name ?? 'Unnamed Product'
  const productPrice = item.product?.price ?? 0
  const productStock = item.product?.stock ?? 0

  // Instant local counter state
  const [localQuantity, setLocalQuantity] = useState<number>(item.quantity)

  // Sync with server updates
  useEffect(() => {
    setLocalQuantity(item.quantity)
  }, [item.quantity])

  // Debounce API calls by 400ms
  useEffect(() => {
    if (localQuantity === item.quantity) return

    const timer = setTimeout(() => {
      onUpdate(item.id, localQuantity)
    }, 400)

    return () => clearTimeout(timer)
  }, [localQuantity, item.id, item.quantity, onUpdate])

  return (
    <article className="flex gap-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        {image ? (
          <img
            src={image}
            alt={productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-medium text-neutral-900">
          {productName}
        </h3>

        <p className="mt-1 text-sm text-neutral-500">
          {formatPrice(productPrice)}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-full border border-neutral-200 bg-neutral-50 p-0.5">
            <button
              type="button"
              disabled={localQuantity <= 1 || isRemoving}
              onClick={() =>
                setLocalQuantity((prev: number) => Math.max(1, prev - 1))
              }
              className="p-1.5 disabled:opacity-40 transition"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>

            <span className="min-w-7 text-center text-sm font-medium text-neutral-900">
              {localQuantity}
            </span>

            <button
              type="button"
              disabled={localQuantity >= productStock || isRemoving}
              onClick={() =>
                setLocalQuantity((prev: number) =>
                  Math.min(productStock, prev + 1)
                )
              }
              className="p-1.5 disabled:opacity-40 transition"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            type="button"
            disabled={isRemoving}
            onClick={() => onRemove(item.id)}
            className="p-2 text-neutral-400 hover:text-red-600 disabled:opacity-40 transition"
            aria-label={`Remove ${productName}`}
          >
            {isRemoving ? (
              <Loader2 size={16} className="animate-spin text-neutral-400" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>
    </article>
  )
}

/* Main Drawer Component */
export default function CartDrawer() {
  const open = useUIStore((state) => state.cartDrawerOpen)
  const setOpen = useUIStore((state) => state.setCartDrawerOpen)

  const cartQuery = useCartQuery(open)
  const updateMutation = useUpdateCartItemMutation()
  const removeMutation = useRemoveCartItemMutation()

  if (!open) {
    return null
  }

  const cart = cartQuery.data
  const items = cart?.items ?? []

  const removingId =
    removeMutation.isPending && removeMutation.variables
      ? removeMutation.variables
      : null

  function handleUpdateQuantity(itemId: number, quantity: number) {
    updateMutation.mutate({ cartItemId: itemId, quantity })
  }

  function handleRemoveItem(itemId: number) {
    removeMutation.mutate(itemId)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        aria-label="Shopping cart"
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-950">
              Your Cart
            </h2>

            <p className="text-sm text-neutral-500">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {cartQuery.isPending && (
            <p className="text-sm text-neutral-500">
              Loading your cart...
            </p>
          )}

          {cartQuery.isError && (
            <div>
              <p className="text-sm text-red-600">
                Unable to load your cart.
              </p>

              <button
                type="button"
                onClick={() => cartQuery.refetch()}
                className="mt-3 text-sm font-medium underline"
              >
                Try again
              </button>
            </div>
          )}

          {!cartQuery.isPending &&
            !cartQuery.isError &&
            items.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-lg font-medium text-neutral-900">
                  Your cart is empty
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Add something you love.
                </p>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-5 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white"
                >
                  Continue Shopping
                </button>
              </div>
            )}

          <div className="space-y-5">
            {items.map((item: CartItem) => (
              <CartDrawerItemRow
                key={item.id}
                item={item}
                onUpdate={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                isRemoving={removingId === item.id}
              />
            ))}
          </div>
        </div>

        {items.length > 0 && (
          <footer className="border-t border-neutral-200 px-5 py-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">
                Total
              </span>

              <strong className="text-lg text-neutral-950">
                {formatPrice(cart?.total ?? 0)}
              </strong>
            </div>

            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="mt-4 block rounded-full bg-black px-5 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
            >
              View Cart
            </Link>

            <Link
              to="/checkout"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-full border border-neutral-300 px-5 py-3 text-center text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Checkout
            </Link>
          </footer>
        )}
      </aside>
    </>
  )
}