import { useEffect, useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Filter,
} from 'lucide-react'

import {
  useCategoriesQuery,
  useProductsQuery,
} from '../hooks/queries/products'

import ProductGrid from '../components/commerce/ProductGrid'
import ProductGridSkeleton from '../components/ui/ProductGridSkeleton'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'

export default function ProductsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [page, setPage] = useState(1)

  // Mobile UI state only
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [headerExpanded, setHeaderExpanded] = useState(false)

  const categoriesQuery = useCategoriesQuery()

  const productsQuery = useProductsQuery({
    page,
    per_page: 12,
    is_active: true,
    ...(search ? { search } : {}),
    ...(categoryId !== '' ? { category_id: categoryId } : {}),
  })

  useEffect(() => {
    setPage(1)
  }, [search, categoryId])

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
    setMobileFiltersOpen(false) // close panel after search on mobile
  }

  function clearFilters() {
    setSearchInput('')
    setSearch('')
    setCategoryId('')
    setPage(1)
  }

  const products = productsQuery.data?.data ?? []
  const total = productsQuery.data?.meta?.total ?? products.length
  const lastPage = productsQuery.data?.meta?.last_page ?? 1
  const hasActiveFilters = Boolean(search) || categoryId !== ''

  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        {/* ========== MOBILE HEADER (compact + expandable) ========== */}
        <div className="mb-3 sm:mb-8">
          {/* Always-visible compact bar on mobile */}
          <button
            type="button"
            onClick={() => setHeaderExpanded((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-left shadow-sm sm:hidden"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                Marketplace
              </p>
              <h1 className="text-base font-bold tracking-tight text-neutral-950">
                Discover products
              </h1>
            </div>
            <ChevronDown
              size={18}
              className={`text-neutral-500 transition-transform ${
                headerExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Expanded description only when opened on mobile */}
          {headerExpanded && (
            <div className="mt-2 rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-600 sm:hidden">
              Explore our marketplace and find products that fit what you're
              looking for.
            </div>
          )}

          {/* Desktop / tablet header (unchanged visual weight) */}
          <div className="hidden sm:block">
            <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Marketplace
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
              Discover products
            </h1>
            <p className="mt-3 max-w-2xl text-base text-neutral-600">
              Explore our marketplace and find products that fit what you're
              looking for.
            </p>
          </div>
        </div>

        {/* ========== FILTERS ========== */}
        {/* Mobile: collapsible panel triggered by button */}
        <div className="mb-4 sm:mb-8">
          {/* Mobile trigger bar */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm"
            >
              <Filter size={16} />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white">
                  !
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Mobile expandable panel */}
          {mobileFiltersOpen && (
            <div className="mt-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:hidden">
              <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search products..."
                    aria-label="Search products"
                    className="h-10 w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>

                <div className="relative">
                  <SlidersHorizontal
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      const value = e.target.value
                      setCategoryId(value ? Number(value) : '')
                    }}
                    aria-label="Filter by category"
                    disabled={categoriesQuery.isLoading}
                    className="h-10 w-full appearance-none rounded-xl border border-neutral-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-60"
                  >
                    <option value="">All categories</option>
                    {categoriesQuery.data?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="h-10 rounded-xl bg-black text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  Search
                </button>
              </form>

              {hasActiveFilters && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('')
                        setSearch('')
                        setPage(1)
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium"
                    >
                      Search: {search}
                      <X size={12} />
                    </button>
                  )}
                  {categoryId !== '' && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryId('')
                        setPage(1)
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium"
                    >
                      Category
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Desktop / tablet filters (original layout) */}
          <div className="hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:block sm:p-5">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col gap-3 lg:flex-row"
            >
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                />
              </div>

              <div className="relative lg:w-64">
                <SlidersHorizontal
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <select
                  value={categoryId}
                  onChange={(e) => {
                    const value = e.target.value
                    setCategoryId(value ? Number(value) : '')
                  }}
                  aria-label="Filter by category"
                  disabled={categoriesQuery.isLoading}
                  className="h-11 w-full appearance-none rounded-xl border border-neutral-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">All categories</option>
                  {categoriesQuery.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="h-11 rounded-xl bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                Search
              </button>
            </form>

            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-neutral-500">
                  Active filters:
                </span>
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('')
                      setSearch('')
                      setPage(1)
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
                  >
                    Search: {search}
                    <X size={13} />
                  </button>
                )}
                {categoryId !== '' && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryId('')
                      setPage(1)
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
                  >
                    Category
                    <X size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-neutral-900 underline underline-offset-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Result information */}
        {!productsQuery.isLoading && !productsQuery.isError && (
          <div className="mb-3 flex items-center justify-between gap-4 sm:mb-5">
            <p className="text-xs text-neutral-600 sm:text-sm">
              <span className="font-semibold text-neutral-900">{total}</span>{' '}
              {total === 1 ? 'product' : 'products'} found
            </p>
            {productsQuery.isFetching && (
              <span className="text-xs text-neutral-500">Updating...</span>
            )}
          </div>
        )}

        {/* Error */}
        {productsQuery.isError && (
          <ErrorState
            description="Unable to load products right now. Please try again."
            onRetry={() => productsQuery.refetch()}
          />
        )}

        {/* Initial loading */}
        {productsQuery.isLoading && <ProductGridSkeleton />}

        {/* Empty */}
        {!productsQuery.isLoading &&
          !productsQuery.isError &&
          products.length === 0 && (
            <EmptyState
              title="No products found"
              description="Try changing your search or category filter."
            />
          )}

        {/* Products */}
        {!productsQuery.isLoading &&
          !productsQuery.isError &&
          products.length > 0 && (
            <>
              <ProductGrid products={products} />

              {lastPage > 1 && (
                <nav
                  aria-label="Product pagination"
                  className="mt-8 flex items-center justify-center gap-3 sm:mt-10 sm:gap-4"
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:py-2.5"
                  >
                    Previous
                  </button>

                  <span className="text-xs text-neutral-600 sm:text-sm">
                    Page{' '}
                    <strong className="text-neutral-900">{page}</strong> of{' '}
                    <strong className="text-neutral-900">{lastPage}</strong>
                  </span>

                  <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:py-2.5"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
      </section>
    </div>
  )
}