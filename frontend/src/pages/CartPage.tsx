import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from 'lucide-react'

import {
  useCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '../hooks/queries/cart'

function formatPrice(price: string | number) {
  const numericPrice = Number(price)
  if (Number.isNaN(numericPrice)) return String(price)

  return `৳${numericPrice.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/* Individual Item Component with Strict Typing & Debounced Local State */
function CartItemRow({
  item,
  onUpdate,
  onRemove,
  isUpdating,
}: {
  item: any
  onUpdate: (itemId: number, quantity: number) => void
  onRemove: (itemId: number) => void
  isUpdating: boolean
}) {
  const productName = item.product?.name ?? 'Unnamed Product'
  const productPrice = item.product?.price ?? 0
  const productStock = item.product?.stock ?? 0
  const image = item.product?.images?.[0]?.image_url

  // Explicitly type local counter state as number
  const [localQuantity, setLocalQuantity] = useState<number>(item.quantity)

  // Keep local quantity in sync with server when data refetches
  useEffect(() => {
    setLocalQuantity(item.quantity)
  }, [item.quantity])

  // Debounce API calls: wait 400ms after last click before sending to server
  useEffect(() => {
    if (localQuantity === item.quantity) return

    const timer = setTimeout(() => {
      onUpdate(item.id, localQuantity)
    }, 400)

    return () => clearTimeout(timer)
  }, [localQuantity, item.id, item.quantity, onUpdate])

  return (
    <article className="group relative flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition sm:flex-row sm:items-center sm:justify-between">
      {/* Product Meta */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50">
          {image ? (
            <img
              src={image}
              alt={productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              <ShoppingBag className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-neutral-900 line-clamp-1">
            {productName}
          </h2>
          <p className="text-xs font-bold text-neutral-950">
            {formatPrice(productPrice)}
          </p>
          <p
            className={`text-[11px] font-medium ${
              productStock > 0 ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {productStock > 0
              ? `In stock (${productStock})`
              : 'Out of stock'}
          </p>
        </div>
      </div>

      {/* Quantity & Actions */}
      <div className="flex items-center justify-between gap-6 border-t border-neutral-100 pt-3 sm:border-0 sm:pt-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50/50 p-1">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={localQuantity <= 1}
              onClick={() =>
                setLocalQuantity((prev: number) => Math.max(1, prev - 1))
              }
              className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <span className="w-8 text-center text-xs font-semibold text-neutral-900">
              {localQuantity}
            </span>

            <button
              type="button"
              aria-label="Increase quantity"
              disabled={localQuantity >= productStock}
              onClick={() =>
                setLocalQuantity((prev: number) =>
                  Math.min(productStock, prev + 1)
                )
              }
              className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            aria-label="Remove item"
            onClick={() => onRemove(item.id)}
            className="rounded-xl p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block sm:hidden">
            Subtotal
          </span>
          <span className="text-sm font-bold text-neutral-950">
            {formatPrice(Number(productPrice) * localQuantity)}
          </span>
        </div>
      </div>
    </article>
  )
}

/* Main Cart Page Component */
export default function CartPage() {
  const cartQuery = useCartQuery()
  const updateMutation = useUpdateCartItemMutation()
  const removeMutation = useRemoveCartItemMutation()

  const cart = cartQuery.data

  const updatingId =
    updateMutation.variables?.cartItemId ??
    removeMutation.variables ??
    null

  if (cartQuery.isPending) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 py-8">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-neutral-200" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-neutral-200"
              />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />
        </div>
      </div>
    )
  }

  if (cartQuery.isError) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">
          Unable to Load Cart
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          {cartQuery.error instanceof Error
            ? cartQuery.error.message
            : 'Something went wrong while fetching your shopping cart.'}
        </p>
        <button
          type="button"
          onClick={() => cartQuery.refetch()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-neutral-800 transition"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    )
  }

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-neutral-800"
        >
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  function handleQuantityChange(itemId: number, quantity: number) {
    updateMutation.mutate({ cartItemId: itemId, quantity })
  }

  function handleRemove(itemId: number) {
    removeMutation.mutate(itemId)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-6">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Shopping Cart
          </h1>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <Link
          to="/products"
          className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition"
        >
          Continue Shopping &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item: any) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdate={handleQuantityChange}
              onRemove={handleRemove}
              isUpdating={updatingId === item.id}
            />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="border-b border-neutral-200 pb-3 text-sm font-semibold text-neutral-900">
              Order Summary
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">
                  {formatPrice(cart.total)}
                </span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="text-xs font-medium text-emerald-600">
                  Calculated at checkout
                </span>
              </div>

              <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-neutral-900">Total</span>
                <span className="text-xl font-bold text-neutral-950">
                  {formatPrice(cart.total)}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 py-3.5 text-xs font-semibold text-white shadow-md transition hover:bg-neutral-800"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Secure & encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}