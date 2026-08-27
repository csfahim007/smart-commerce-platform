import { useState } from 'react'
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { AlertCircle, Lock, Loader2, ShieldCheck } from 'lucide-react'

interface StripePaymentFormProps {
  onSuccess?: () => void
}

export default function StripePaymentForm({
  onSuccess,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    try {
      setIsProcessing(true)
      setErrorMessage(null)

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
        },
      })

      if (error) {
        setErrorMessage(error.message ?? 'Unable to complete payment.')
      } else {
        onSuccess?.()
      }
    } catch (error) {
      console.error('[STRIPE] Payment confirmation failed:', error)
      setErrorMessage('Unable to complete payment. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Security Banner */}
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3 text-xs text-neutral-600">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>Your payment info is encrypted and secured by Stripe.</span>
      </div>

      {/* Stripe Managed Form Element */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 shadow-sm"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 py-3.5 text-xs font-semibold text-white shadow-md transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5 text-amber-300" />
            <span>Pay Now</span>
          </>
        )}
      </button>
    </form>
  )
}