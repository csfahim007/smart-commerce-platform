import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  ShoppingBag,
  Truck,
  User,
  XCircle,
} from 'lucide-react'

import { useOrderQuery } from '../hooks/queries/orders'

function formatPrice(price: string | number) {
  const numericPrice = Number(price)
  if (Number.isNaN(numericPrice)) return String(price)

  return `৳${numericPrice.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('en-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: RefreshCw },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck },
]

function getStatusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'shipped':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'processing':
    case 'confirmed':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-neutral-100 text-neutral-700 border-neutral-200'
  }
}

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const orderQuery = useOrderQuery(id)
  const order = orderQuery.data

  if (orderQuery.isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 py-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-200" />
        <div className="h-32 animate-pulse rounded-2xl bg-neutral-200" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="h-64 animate-pulse rounded-2xl bg-neutral-200 md:col-span-2" />
          <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />
        </div>
      </div>
    )
  }

  if (orderQuery.isError || !order) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">
          Unable to Load Order
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          We couldn't retrieve the details for this order. It may have been moved or removed.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => orderQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-neutral-800 transition"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  // Calculate progress step index
  const currentStatusLower = order.status.toLowerCase()
  const currentStepIndex = ORDER_STEPS.findIndex(
    (step) => step.key === currentStatusLower,
  )
  const isCancelled = currentStatusLower === 'cancelled'

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Orders
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Order #{order.order_number}
            </h1>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${getStatusBadgeClass(
                order.status,
              )}`}
            >
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 transition"
        >
          <ShoppingBag className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>

      {/* Fulfillment Status Tracker */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-6">
          Fulfillment Status
        </h2>

        {isCancelled ? (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle className="h-5 w-5 shrink-0" />
            <p>This order was cancelled and is no longer being processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {ORDER_STEPS.map((step, idx) => {
              const Icon = step.icon
              const isPassed = currentStepIndex >= idx
              const isCurrent = currentStepIndex === idx

              return (
                <div
                  key={step.key}
                  className={`flex flex-col items-center text-center ${
                    isPassed ? 'text-neutral-900' : 'text-neutral-300'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                      isCurrent
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                        : isPassed
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`mt-2 text-xs ${
                      isCurrent ? 'font-bold text-neutral-900' : 'font-medium'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Purchased Items List */}
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 bg-neutral-50/50 px-6 py-4">
              <h2 className="text-sm font-semibold text-neutral-900">
                Order Items ({order.items?.length ?? 0})
              </h2>
            </div>

            <div className="divide-y divide-neutral-200">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-6 transition hover:bg-neutral-50/50"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-neutral-900">
                      {item.product_name}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>

                  <div className="text-right font-bold text-neutral-900">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                <MapPin className="h-4 w-4 text-neutral-500" /> Shipping Info
              </h3>
              <div className="space-y-1.5 text-sm text-neutral-700">
                <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-neutral-400" />
                  {order.shipping_name || 'N/A'}
                </p>
                <p className="flex items-center gap-1.5 text-neutral-600">
                  <Phone className="h-3.5 w-3.5 text-neutral-400" />
                  {order.shipping_phone || 'N/A'}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                  {order.shipping_address}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                <CreditCard className="h-4 w-4 text-neutral-500" /> Payment Info
              </h3>
              <div className="space-y-1 text-sm text-neutral-700">
                <p className="text-xs text-neutral-500">Payment Method</p>
                <p className="font-semibold capitalize text-neutral-900">
                  {order.payment_method || 'Standard Checkout'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-neutral-900 border-b border-neutral-200 pb-3">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-medium text-neutral-900">
                  {formatPrice(order.subtotal ?? order.total)}
                </span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="font-medium text-neutral-900">
                  {formatPrice(order.shipping_cost ?? 0)}
                </span>
              </div>

              <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-neutral-900">Total</span>
                <span className="text-xl font-bold text-neutral-950">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}