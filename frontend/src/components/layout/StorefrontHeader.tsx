import { Link, NavLink } from 'react-router-dom'
import { ShoppingBag, Sparkles, User, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCartQuery } from '../../hooks/queries/cart'
import { useUIStore } from '../../stores/ui.store'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'text-sm font-medium transition-colors',
    isActive
      ? 'text-neutral-950'
      : 'text-neutral-500 hover:text-neutral-950',
  ].join(' ')
}

export default function StorefrontHeader() {
  const { user, isAuthenticated, logout } = useAuth()

  const cartQuery = useCartQuery(isAuthenticated)

  const cartDrawerOpen = useUIStore((state) => state.cartDrawerOpen)
  const setCartDrawerOpen = useUIStore((state) => state.setCartDrawerOpen)

  // Check if current user is an admin
  const isAdmin = user?.role === 'admin'

  /*
   * Safely check if items is an array before reducing to prevent runtime TypeErrors.
   */
  const cartItems = Array.isArray(cartQuery.data?.items)
    ? cartQuery.data.items
    : []

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  async function handleLogout() {
    await logout()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-neutral-950"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white">
            AI
          </span>

          <span className="hidden sm:inline">AI Commerce</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/orders" className={navLinkClass}>
                Orders
              </NavLink>

              <NavLink to="/ai-assistant" className={navLinkClass}>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Assistant
                </span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Admin Switch Button (Desktop) */}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Admin Panel</span>
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <span className="hidden items-center gap-2 px-2 text-sm text-neutral-600 lg:inline-flex">
                <User className="h-4 w-4" />
                {user?.name}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 sm:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Register
              </Link>
            </>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setCartDrawerOpen(!cartDrawerOpen)}
              aria-label={`Shopping cart${cartItemCount > 0 ? ` with ${cartItemCount} items` : ''}`}
              className="relative inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-sm font-medium text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              <ShoppingBag className="h-4 w-4" />

              <span className="hidden sm:inline">Cart</span>

              {cartItemCount > 0 && (
                <span className="flex min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1.5 py-0.5 text-xs font-semibold text-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="border-t border-neutral-100 md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2.5 sm:px-6">
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 rounded-md bg-neutral-950 px-2.5 py-1 text-xs font-semibold text-white whitespace-nowrap"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Admin
            </Link>
          )}

          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/orders" className={navLinkClass}>
                Orders
              </NavLink>

              <NavLink to="/ai-assistant" className={navLinkClass}>
                AI Assistant
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}