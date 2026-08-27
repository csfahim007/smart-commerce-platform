import { Link, useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronRight,
  Copy,
  Check,
  Package,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams()
  const [copied, setCopied] = useState(false)

  const paymentIntent = searchParams.get('payment_intent')
  const paymentIntentClientSecret = searchParams.get(
    'payment_intent_client_secret',
  )

  function handleCopyReference() {
    if (paymentIntent) {
      navigator.clipboard.writeText(paymentIntent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="mx-auto max-w-xl py-12 sm:py-16">
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-12">
        {/* Animated Checkmark Badge */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
        </div>

        {/* Title & Tagline */}
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Payment Successful!
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Thank you for your purchase. Your order has been placed and is now being processed.
        </p>

        {/* Payment Reference Details Card */}
        {paymentIntent && (
          <div className="mt-8 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                Payment Reference
              </span>
              <button
                type="button"
                onClick={handleCopyReference}
                className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="mt-1 font-mono text-xs font-semibold text-neutral-800 break-all">
              {paymentIntent}
            </p>
          </div>
        )}

        {/* Status Message */}
        {paymentIntentClientSecret && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Confirmation email and tracking updates will follow shortly.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 py-3 text-xs font-semibold text-white shadow-md transition hover:bg-neutral-800"
          >
            <Package className="h-4 w-4" />
            View My Orders
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>

          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}