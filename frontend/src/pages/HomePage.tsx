import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  useCategoriesQuery,
  useProductsQuery,
} from '../hooks/queries/products'

import ProductCard from '../components/commerce/ProductCard'
import ProductGridSkeleton from '../components/ui/ProductGridSkeleton'

export default function HomePage() {
  const productsQuery = useProductsQuery({
    is_active: true,
    per_page: 8,
    page: 1,
  })

  const categoriesQuery = useCategoriesQuery()

  const products = productsQuery.data?.data ?? []
  const categories = categoriesQuery.data ?? []

  return (
    <div className="space-y-16 pb-10">
      {/* Hero – more interactive & layered */}
      <section className="relative overflow-hidden rounded-3xl bg-neutral-950 px-6 py-16 text-white sm:px-10 lg:px-16 lg:py-24">
        {/* Decorative background layers */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm transition hover:bg-white/15">
            <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            AI-powered shopping
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Discover products
            <span className="mt-1 block bg-gradient-to-r from-neutral-300 via-white to-neutral-400 bg-clip-text text-transparent">
              you'll actually love.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-neutral-400 sm:text-lg">
            Browse our curated collection or use the AI assistant to find
            products based on what you're looking for.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/products"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-white/10 transition hover:bg-neutral-100 hover:shadow-white/20"
            >
              Shop products
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/ai-assistant"
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
            >
              <Sparkles className="h-4 w-4 text-violet-300 transition group-hover:scale-110" />
              Ask AI
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Browse
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
                Shop by category
              </h2>
            </div>

            <Link
              to="/products"
              className="hidden items-center gap-1 text-sm font-semibold text-neutral-600 transition hover:text-neutral-950 sm:flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories
              .filter((category) => category.is_active)
              .slice(0, 8)
              .map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category_id=${category.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-200/60"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <p className="font-semibold text-neutral-900 group-hover:text-neutral-950">
                      {category.name}
                    </p>
                    {category.products_count !== undefined && (
                      <p className="mt-1 text-sm text-neutral-500">
                        {category.products_count} products
                      </p>
                    )}
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Featured Products – 3 columns on mobile */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Featured
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
              Featured products
            </h2>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-600 transition hover:text-neutral-950"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {productsQuery.isLoading ? (
          <ProductGridSkeleton />
        ) : productsQuery.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            We couldn't load products right now. Please try again shortly.
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
            <p className="font-semibold text-neutral-900">
              No products available yet.
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Check back soon for new products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}