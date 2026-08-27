import { type SyntheticEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Filter,
  Loader2,
  PackageX,
  Search,
  Send,
  Sparkles,
  Store,
  Tag,
  User,
} from 'lucide-react'

import { askProductAssistant } from '../api/ai'
import type { Product, ProductAssistantResult } from '../types/api'

function formatPrice(price: string | number) {
  const numericPrice = Number(price)
  if (Number.isNaN(numericPrice)) return String(price)

  return `৳${numericPrice.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0]?.image_url

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:border-neutral-300 hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <Store className="h-8 w-8" />
          </div>
        )}

        {product.category && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-800 shadow-sm backdrop-blur-md">
            <Tag className="h-3 w-3 text-neutral-500" />
            {product.category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="line-clamp-1 font-semibold text-neutral-900 transition group-hover:text-neutral-700">
            {product.name}
          </h3>

          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-base font-bold text-neutral-950">
              {formatPrice(product.price)}
            </span>
            <span
              className={`text-xs font-medium ${
                product.stock > 0 ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>

        <Link
          to={`/products/${product.id}`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2 text-xs font-medium text-white transition hover:bg-neutral-800"
        >
          View Details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  )
}

export default function AIAssistantPage() {
  const [message, setMessage] = useState('')
  const [lastQuery, setLastQuery] = useState('')
  const [result, setResult] = useState<ProductAssistantResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleQuery(query: string) {
    const trimmed = query.trim()
    if (!trimmed) {
      setError('Please describe what you are looking for.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setResult(null)
      setLastQuery(trimmed)

      const response = await askProductAssistant(trimmed)
      setResult(response)
    } catch (err: any) {
      console.error('[AI ASSISTANT] Request failed:', err)
      setError(
        err?.response?.data?.message ||
          'Unable to get recommendations right now. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    handleQuery(message)
  }

  // Pure data-driven check: if products array exists and is non-empty
  const hasProducts = Boolean(result?.products && result.products.length > 0)

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6">
      {/* Page Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-white shadow-md">
          <Sparkles className="h-6 w-6 text-amber-300" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          AI Shopping Assistant
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
          Describe what you need, your budget, or specific preferences, and our assistant will scan the store for you.
        </p>
      </div>

      {/* Feature Highlights Bar (Fills design gap naturally) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white/60 p-3 text-xs text-neutral-600 shadow-sm backdrop-blur-sm">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
            <Search className="h-3.5 w-3.5" />
          </div>
          <span>Natural query matching for exact specs</span>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white/60 p-3 text-xs text-neutral-600 shadow-sm backdrop-blur-sm">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
            <Filter className="h-3.5 w-3.5" />
          </div>
          <span>Automatic price & budget filtering</span>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white/60 p-3 text-xs text-neutral-600 shadow-sm backdrop-blur-sm">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <span>Real-time live inventory checks</span>
        </div>
      </div>

      {/* Query Input Card */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition focus-within:border-neutral-950 focus-within:ring-1 focus-within:ring-neutral-950">
        <form onSubmit={handleSubmit} className="p-4">
          <label htmlFor="ai-message" className="sr-only">
            What are you looking for?
          </label>

          <textarea
            id="ai-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: I need a gaming laptop under 100,000 BDT or mechanical keyboards for coding..."
            rows={3}
            disabled={loading}
            className="w-full resize-none bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
          />

          <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
            <span className="text-xs text-neutral-400">
              Press <kbd className="rounded border bg-neutral-50 px-1 py-0.5 text-[10px]">Enter ↵</kbd> to submit
            </span>

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
                  Analyzing Store...
                </>
              ) : (
                <>
                  Ask AI
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      {/* AI Recommendation Output */}
      {!loading && result && (
        <div className="space-y-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6 shadow-sm">
          {/* User Query Bubble */}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-700">
              <User className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-neutral-200 bg-white p-3.5 text-sm font-medium text-neutral-900 shadow-sm">
              {lastQuery}
            </div>
          </div>

          {/* Assistant Response Bubble */}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white shadow">
              <Bot className="h-4 w-4 text-amber-300" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="rounded-2xl rounded-tl-none border border-neutral-200 bg-white p-4 text-sm leading-relaxed text-neutral-800 shadow-sm">
                <p>{result.message}</p>
              </div>

              {/* Recommended Products Grid */}
              <div className="pt-2">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Recommended Products ({hasProducts ? result.products.length : 0})
                </h2>

                {!hasProducts ? (
                  <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center">
                    <PackageX className="mx-auto h-8 w-8 text-neutral-300" />
                    <p className="mt-2 text-sm font-medium text-neutral-900">
                      No direct matches found
                    </p>
                    <p className="text-xs text-neutral-500">
                      Try broadening your price range or adjusting keywords.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {result.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}