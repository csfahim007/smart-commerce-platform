import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Filter,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react'

import {
  useAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
} from '../hooks/queries/adminOrders'

const statuses = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const

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

export default function AdminOrdersPage() {
  const ordersQuery = useAdminOrdersQuery()
  const updateStatusMutation = useUpdateAdminOrderStatusMutation()

  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  const orders = ordersQuery.data?.data ?? []

  const updatingId = updateStatusMutation.isPending
    ? updateStatusMutation.variables?.orderId ?? null
    : null

  const error = ordersQuery.isError
    ? ordersQuery.error
    : updateStatusMutation.error

  function getErrorMessage(err: any) {
    return err?.response?.data?.message || 'Unable to process request.'
  }

  async function handleStatusChange(orderId: number, status: string) {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status })
    } catch (err) {
      console.error('[ADMIN ORDERS] Status update failed:', err)
    }
  }

  // Filtered orders
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      String(order.user_id).includes(search) ||
      (order.shipping_address &&
        order.shipping_address.toLowerCase().includes(search.toLowerCase()))

    const matchesStatus =
      selectedStatus === 'all' ||
      order.status.toLowerCase() === selectedStatus.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Metrics summary calculations
  const totalRevenue = orders.reduce(
    (acc: number, item: any) => acc + (Number(item.total) || 0),
    0,
  )
  const pendingOrders = orders.filter(
    (o: any) => o.status.toLowerCase() === 'pending',
  ).length

  if (ordersQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-neutral-200"
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-neutral-200" />
      </div>
    )
  }

  if (ordersQuery.isError) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">
          Failed to Load Orders
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          {getErrorMessage(ordersQuery.error)}
        </p>
        <button
          type="button"
          onClick={() => ordersQuery.refetch()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-neutral-800 transition"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 hover:text-neutral-900 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
            Orders Management
          </h1>
          <p className="text-sm text-neutral-500">
            Track, update, and manage overall customer order fulfillment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => ordersQuery.refetch()}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 transition"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Metrics Header */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">
              Total Orders
            </span>
            <Package className="h-5 w-5 text-neutral-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-neutral-900">
            {orders.length}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">
              Pending Fulfillment
            </span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-neutral-900">
            {pendingOrders}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">
              Total Revenue
            </span>
            <ShoppingBag className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-neutral-900">
            {formatPrice(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by Order # or Address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-neutral-400 shrink-0" />
          <button
            type="button"
            onClick={() => setSelectedStatus('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
              selectedStatus === 'all'
                ? 'bg-neutral-950 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All
          </button>
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition whitespace-nowrap ${
                selectedStatus === status
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="mt-2 text-sm font-medium text-neutral-900">
              No orders found
            </p>
            <p className="text-xs text-neutral-500">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50/50 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5">Total</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredOrders.map((order: any) => {
                  const isUpdating = updatingId === order.id

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-neutral-50/50 transition"
                    >
                      <td className="px-6 py-4 font-semibold text-neutral-900">
                        #{order.order_number}
                        <div className="text-xs font-normal text-neutral-500">
                          {order.items?.length ?? 0} item(s)
                        </div>
                      </td>

                      <td className="px-6 py-4 text-neutral-600 whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </td>

                      <td className="px-6 py-4 text-neutral-600 capitalize">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-neutral-400" />
                          {order.payment_method || 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-neutral-900">
                        {formatPrice(order.total)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            className={`rounded-full border px-3 py-1 text-xs font-medium capitalize outline-none transition cursor-pointer ${getStatusBadge(
                              order.status,
                            )}`}
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s} className="bg-white text-neutral-900">
                                {s}
                              </option>
                            ))}
                          </select>

                          {isUpdating && (
                            <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition"
                        >
                          <Eye className="h-3.5 w-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Order #{selectedOrder.order_number}
                </h3>
                <p className="text-xs text-neutral-500">
                  Placed on {formatDate(selectedOrder.created_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg bg-neutral-50 p-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase text-neutral-400">
                    Customer ID
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">
                    User #{selectedOrder.user_id}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-neutral-400">
                    Shipping Address
                  </p>
                  <p className="mt-1 font-medium text-neutral-900 flex items-start gap-1">
                    <MapPin className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                    {selectedOrder.shipping_address || 'No address provided'}
                  </p>
                </div>
              </div>

              {/* Purchased Items List */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-2">
                  Purchased Items ({selectedOrder.items?.length ?? 0})
                </h4>

                <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
                  {selectedOrder.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-neutral-900">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>

                      <p className="font-semibold text-neutral-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
                <span className="font-medium text-neutral-600">Total Paid</span>
                <span className="text-xl font-bold text-neutral-900">
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}