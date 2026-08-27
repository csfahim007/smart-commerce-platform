import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Clock,
  Package,
  PackageX,
  RefreshCw,
  ShoppingBag,
  Truck,
} from 'lucide-react'

import { useOrdersQuery } from '../hooks/queries/orders'
import type { Order } from '../types/api'

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

function getStatusBadge(status: string) {
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

export default function OrdersPage() {
  const ordersQuery = useOrdersQuery()

  // Extract array of orders from paginated or raw response
  const orders: Order[] = Array.isArray(ordersQuery.data)
    ? ordersQuery.data
    : ordersQuery.data?.data ?? []

  if (ordersQuery.isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 py-6">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 w-full animate-pulse rounded-2xl bg-neutral-200"
            />
          ))}
        </div>
      </div>
    )
  }

  if (ordersQuery.isError) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">
          Unable to Load Orders
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Something went wrong while retrieving your order history. Please try again.
        </p>
        <button
          type="button"
          onClick={() => ordersQuery.refetch()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-neutral-800 transition"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <PackageX className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">
          No orders yet
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          When you place an order, it will appear here for you to track and manage.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-neutral-800"
        >
          <ShoppingBag className="h-4 w-4" />
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            My Orders
          </h1>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            {orders.length} {orders.length === 1 ? 'order' : 'total orders'} placed
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 transition"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Continue Shopping
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order: Order) => {
          const itemCount = order.items?.length ?? 0

          return (
            <article
              key={order.id}
              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Order Meta */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-neutral-900">
                      #{order.order_number}
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadge(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>

                {/* Right Summary info */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-neutral-100 pt-3 sm:border-0 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-neutral-400">Total Amount</p>
                    <p className="text-base font-bold text-neutral-950">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white transition group-hover:bg-neutral-800"
                  >
                    View Order
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Items Preview Chips */}
              {itemCount > 0 && (
                <div className="mt-4 border-t border-neutral-100 pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-medium text-neutral-400">
                      <Package className="h-3.5 w-3.5" /> {itemCount}{' '}
                      {itemCount === 1 ? 'item' : 'items'}:
                    </span>
                    {order.items?.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 truncate max-w-[200px]"
                      >
                        {item.product_name}
                      </span>
                    ))}
                    {itemCount > 3 && (
                      <span className="text-xs font-medium text-neutral-400">
                        +{itemCount - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}