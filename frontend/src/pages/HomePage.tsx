import { useState } from 'react'
import {
  ArrowRight,
  Sparkles,
  ChevronDown,
  LayoutGrid,
  ShieldCheck,
  Truck,
  Headphones,
  Zap,
  Search,
  ShoppingBag,
  MessageSquare,
} from 'lucide-react'
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

  const [categoriesOpen, setCategoriesOpen] = useState(false)

  const activeCategories = categories
    .filter((category: any) => category.is_active)
    .slice(0, 8)

  return (
    <div className="space-y-12 overflow-x-hidden px-4 pb-10 sm:space-y-16 sm:px-0">
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1a1a1a] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[#1a1a1a]" />
          <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-neutral-700/20 blur-[90px]" />
          <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-neutral-600/10 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col gap-10 px-5 py-14 sm:px-10 sm:py-16 lg:flex-row lg:items-center lg:gap-16 lg:px-16 lg:py-24">
          <div className="max-w-xl flex-1">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-neutral-300">
              AI-powered shopping
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Discover products
              <span className="mt-1 block bg-gradient-to-r from-violet-200 via-white to-cyan-200 bg-clip-text text-transparent">
                you'll actually love.
              </span>
            </h1>

            <p className="mt-5 text-sm leading-6 text-neutral-300 sm:mt-6 sm:text-lg sm:leading-7">
              Browse our curated collection or use the AI assistant to find
              products based on what you're looking for.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
              <Link
                to="/products"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-950 shadow-lg shadow-white/10 transition hover:bg-neutral-100 sm:px-6 sm:py-3.5"
              >
                Shop products
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/ai-assistant"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 sm:px-6 sm:py-3.5"
              >
                Ask AI
              </Link>
            </div>
          </div>

          <div className="hidden flex-1 lg:block">
            <div className="relative mx-auto flex max-w-[360px] items-center justify-center">
              <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-md" />
              <img
                src="/umut-hasanoglu-A6BpGxYBBso-unsplash.jpg"
                alt="AI ecommerce shopping experience"
                className="relative z-10 h-[360px] w-full rounded-[2rem] object-cover opacity-80 shadow-2xl shadow-black/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CATEGORIES ===================== */}
      {activeCategories.length > 0 && (
        <section>
          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => setCategoriesOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
                  <LayoutGrid className="h-4 w-4 text-neutral-700" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-900">
                    Shop by category
                  </p>
                  <p className="text-xs text-neutral-500">
                    {activeCategories.length} categories
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-neutral-500 transition-transform ${
                  categoriesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {categoriesOpen && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="divide-y divide-neutral-100">
                  {activeCategories.map((category: any) => (
                    <Link
                      key={category.id}
                      to={`/products?category_id=${category.id}`}
                      className="flex items-center justify-between px-4 py-3.5 transition hover:bg-neutral-50 active:bg-neutral-100"
                    >
                      <span className="text-sm font-medium text-neutral-900">
                        {category.name}
                      </span>
                      {category.products_count !== undefined && (
                        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                          {category.products_count}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
                <Link
                  to="/products"
                  className="flex items-center justify-center gap-1 border-t border-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  View all products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          <div className="hidden sm:block">
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
                className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-600 transition hover:text-neutral-950"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {activeCategories.map((category: any) => (
                <Link
                  key={category.id}
                  to={`/products?category_id=${category.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-200/50"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-500 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-neutral-900 group-hover:text-neutral-950">
                        {category.name}
                      </p>
                      {category.products_count !== undefined && (
                        <p className="mt-1.5 text-sm text-neutral-500">
                          {category.products_count}{' '}
                          {category.products_count === 1 ? 'product' : 'products'}
                        </p>
                      )}
                    </div>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition group-hover:bg-violet-50 group-hover:text-violet-600">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== FEATURED PRODUCTS ===================== */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Featured
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
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
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ===================== WHY SHOP WITH US ===================== */}
      <section>
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Benefits
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            Why shop with us
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: 'Secure shopping',
              desc: 'Safe payments & data protection',
            },
            {
              icon: Truck,
              title: 'Fast delivery',
              desc: 'Quick shipping across the country',
            },
            {
              icon: Headphones,
              title: 'Support',
              desc: 'Friendly help when you need it',
            },
            {
              icon: Zap,
              title: 'AI recommendations',
              desc: 'Find products that match you',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-neutral-200 bg-white p-4 text-center transition hover:border-neutral-300 hover:shadow-md sm:p-5"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 sm:h-12 sm:w-12">
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-neutral-900 sm:text-base">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="rounded-3xl border border-neutral-200 bg-white px-4 py-8 sm:px-8 sm:py-10">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Simple process
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {[
            {
              step: '01',
              icon: Search,
              title: 'Browse or search',
              desc: 'Explore categories or use AI to describe what you need.',
            },
            {
              step: '02',
              icon: ShoppingBag,
              title: 'Add to cart',
              desc: 'Select your favorite products and add them to your cart.',
            },
            {
              step: '03',
              icon: MessageSquare,
              title: 'Get help from AI',
              desc: 'Not sure? Ask our AI assistant for personalized suggestions.',
            },
          ].map((item) => (
            <div key={item.step} className="relative text-center sm:text-left">
              <div className="mb-3 inline-flex items-center gap-2 sm:mb-4">
                <span className="text-xs font-bold text-violet-600">
                  {item.step}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <item.icon className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="relative overflow-hidden rounded-3xl bg-neutral-950 px-5 py-10 text-white sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-violet-600/25 blur-[80px]" />
          <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-[80px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to find something you’ll love?
          </h2>
          <p className="mt-3 text-sm text-neutral-400 sm:text-base">
            Start browsing our curated collection or let the AI assistant guide
            you to the perfect product.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100 sm:w-auto"
            >
              Start shopping
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/ai-assistant"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Ask AI
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}