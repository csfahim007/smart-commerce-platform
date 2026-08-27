import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  User,
} from 'lucide-react'

import { useCartQuery } from '../hooks/queries/cart'
import { createOrder } from '../api/orders'
import { createPaymentIntent } from '../api/payments'
import StripePaymentForm from '../components/StripePaymentForm'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function formatPrice(price: string | number) {
  const numericPrice = Number(price)
  if (Number.isNaN(numericPrice)) return String(price)

  return `৳${numericPrice.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function CheckoutPage() {
  const cartQuery = useCartQuery()
  const cart = cartQuery.data
  const navigate = useNavigate()

  // Checkout Step Flow: 1 = Shipping, 2 = Payment Method, 3 = Stripe Form (if selected)
  const [activeStep, setActiveStep] = useState<1 | 2>(1)

  // Form Fields
  const [shippingName, setShippingName] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery')

  // Statuses
  const [placingOrder, setPlacingOrder] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stripe State
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [stripePaymentLoading, setStripePaymentLoading] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null)

  function handleShippingSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!shippingAddress.trim()) {
      setError('Shipping address is required.')
      return
    }
    setError(null)
    setActiveStep(2)
  }

  async function handleFinalOrderSubmit() {
    if (!cart || cart.items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    if (!shippingAddress.trim()) {
      setError('Shipping address is required.')
      setActiveStep(1)
      return
    }

    try {
      setPlacingOrder(true)
      setError(null)

      const order = await createOrder({
        shipping_name: shippingName.trim() || undefined,
        shipping_phone: shippingPhone.trim() || undefined,
        shipping_address: shippingAddress.trim(),
        payment_method: paymentMethod,
      })

      if (paymentMethod === 'stripe') {
        try {
          setStripePaymentLoading(true)
          const paymentIntent = await createPaymentIntent(order.id)
          setCreatedOrderId(order.id)
          setClientSecret(paymentIntent.client_secret)
        } catch (stripeErr: any) {
          console.error('[STRIPE] Intent failed:', stripeErr)
          setError(
            stripeErr?.response?.data?.message ||
              'Unable to initialize Stripe payment.',
          )
        } finally {
          setStripePaymentLoading(false)
        }
        return
      }

      navigate(`/orders/${order.id}`, { replace: true })
    } catch (err: any) {
      console.error('[CHECKOUT] Order creation failed:', err)
      const apiMessage = err?.response?.data?.message
      const validationErrors = err?.response?.data?.errors

      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          setError(String(firstError[0]))
          return
        }
      }

      setError(apiMessage || 'Unable to place your order.')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (cartQuery.isPending) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 py-8">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-neutral-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="h-80 animate-pulse rounded-2xl bg-neutral-200" />
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />
        </div>
      </div>
    )
  }

  if (error && !cart) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">Checkout Error</h2>
        <p className="mt-1 text-sm text-neutral-500">{error}</p>
        <button
          type="button"
          onClick={() => cartQuery.refetch()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-neutral-800 transition"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-neutral-800"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  const isSubmitting = placingOrder || stripePaymentLoading

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            Checkout
          </h1>
          <p className="text-xs text-neutral-500">
            {clientSecret
              ? 'Complete your payment'
              : activeStep === 1
              ? 'Step 1 of 2: Shipping details'
              : 'Step 2 of 2: Select payment method'}
          </p>
        </div>

        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Cart
        </Link>
      </div>

      {/* Global Error Message */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700 shadow-sm"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {!clientSecret ? (
            <>
              {/* STEP 1: Shipping Information Form */}
              {activeStep === 1 && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition">
                  <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                      1
                    </div>
                    <h2 className="text-sm font-bold text-neutral-900">
                      Shipping Information
                    </h2>
                  </div>

                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="shipping-name"
                          className="mb-1 block text-[11px] font-semibold text-neutral-700"
                        >
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                          <input
                            id="shipping-name"
                            type="text"
                            value={shippingName}
                            onChange={(e) => setShippingName(e.target.value)}
                            placeholder="Ahmed Fahim Kabir"
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-2 pl-8 pr-3 text-xs font-medium text-neutral-900 outline-none transition focus:border-neutral-950 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="shipping-phone"
                          className="mb-1 block text-[11px] font-semibold text-neutral-700"
                        >
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                          <input
                            id="shipping-phone"
                            type="tel"
                            value={shippingPhone}
                            onChange={(e) => setShippingPhone(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-2 pl-8 pr-3 text-xs font-medium text-neutral-900 outline-none transition focus:border-neutral-950 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="shipping-address"
                        className="mb-1 block text-[11px] font-semibold text-neutral-700"
                      >
                        Shipping Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="shipping-address"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="House, Road, Area, City"
                        rows={3}
                        required
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-2.5 text-xs font-medium text-neutral-900 outline-none transition focus:border-neutral-950 focus:bg-white resize-none"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-neutral-800 transition"
                      >
                        Continue to Payment &rarr;
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 2: Payment Selection Form */}
              {activeStep === 2 && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition">
                  {/* Address Summary Badge */}
                  <div className="mb-5 flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 shrink-0 text-neutral-500" />
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {shippingName || 'No Name'} • {shippingPhone || 'No Phone'}
                        </p>
                        <p className="text-neutral-500 line-clamp-1">
                          {shippingAddress}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="text-xs font-semibold text-neutral-600 underline hover:text-neutral-900"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                      2
                    </div>
                    <h2 className="text-sm font-bold text-neutral-900">
                      Select Payment Method
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                        paymentMethod === 'cash_on_delivery'
                          ? 'border-neutral-950 bg-neutral-50/80 ring-1 ring-neutral-950'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-neutral-950 focus:ring-neutral-950"
                      />
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                          <Banknote className="h-3.5 w-3.5 text-neutral-600" />
                          Cash on Delivery
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Pay upon delivery
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                        paymentMethod === 'stripe'
                          ? 'border-neutral-950 bg-neutral-50/80 ring-1 ring-neutral-950'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="stripe"
                        checked={paymentMethod === 'stripe'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-neutral-950 focus:ring-neutral-950"
                      />
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                          <CreditCard className="h-3.5 w-3.5 text-neutral-600" />
                          Card (Stripe)
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Instant online payment
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back to Shipping
                    </button>

                    <button
                      type="button"
                      onClick={handleFinalOrderSubmit}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
                          <span>Processing...</span>
                        </>
                      ) : paymentMethod === 'stripe' ? (
                        <>
                          <Lock className="h-3.5 w-3.5 text-amber-300" />
                          <span>Proceed to Card Payment</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>Place Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* STEP 3: Stripe Interactive Form */
            <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="text-sm font-bold text-neutral-900">
                  Card Payment Details
                </h2>
                {createdOrderId && (
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Order <strong className="text-neutral-900">#{createdOrderId}</strong> created. Enter payment details below:
                  </p>
                )}
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm
                  onSuccess={() => {
                    navigate(`/orders/${createdOrderId}`, { replace: true })
                  }}
                />
              </Elements>
            </section>
          )}
        </div>

        {/* Right Column: Persistent Order Summary */}
        <div className="lg:col-span-1">
          <aside className="sticky top-20 space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="border-b border-neutral-100 pb-2.5 text-xs font-bold uppercase tracking-wider text-neutral-500">
              Order Summary ({cart.items.length})
            </h2>

            <div className="max-h-56 divide-y divide-neutral-100 overflow-y-auto pr-1">
              {cart.items.map((item) => {
                const productName = item.product?.name ?? 'Unnamed Product'
                const productPrice = item.product?.price ?? 0

                return (
                  <article key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex justify-between text-xs">
                      <div className="pr-2">
                        <p className="font-semibold text-neutral-900 line-clamp-1">
                          {productName}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Qty: {item.quantity} × {formatPrice(productPrice)}
                        </p>
                      </div>
                      <p className="font-bold text-neutral-950 shrink-0">
                        {formatPrice(Number(productPrice) * item.quantity)}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>

            <div className="border-t border-neutral-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">
                  {formatPrice(cart.total)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>

              <div className="border-t border-neutral-200 pt-2.5 flex justify-between items-baseline">
                <span className="font-bold text-neutral-900">Total</span>
                <span className="text-lg font-bold text-neutral-950">
                  {formatPrice(cart.total)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-neutral-400 border-t border-neutral-100">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Encrypted Checkout</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}