import { LogOut, Menu, ShoppingBag } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useUIStore } from '../../stores/ui.store'

function navClass({
  isActive,
}: {
  isActive: boolean
}) {
  return [
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-neutral-950 text-white'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950',
  ].join(' ')
}

export default function AdminHeader() {
  const { user, logout } = useAuth()

  const mobileMenuOpen = useUIStore(
    (state) => state.mobileMenuOpen,
  )

  const toggleMobileMenu = useUIStore(
    (state) => state.toggleMobileMenu,
  )

  async function handleLogout() {
    toggleMobileMenu()
    await logout()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/admin"
          className="flex items-center gap-2 font-bold tracking-tight text-neutral-950"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-xs font-bold text-white">
            AI
          </span>

          <span>Commerce Admin</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            aria-label="Go to storefront"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950"
          >
            <ShoppingBag className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label="Toggle admin navigation"
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="border-t border-neutral-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col space-y-1">
            <NavLink
              end
              to="/admin"
              className={navClass}
              onClick={toggleMobileMenu}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/products"
              className={navClass}
              onClick={toggleMobileMenu}
            >
              Products
            </NavLink>

            <NavLink
              to="/admin/categories"
              className={navClass}
              onClick={toggleMobileMenu}
            >
              Categories
            </NavLink>

            <NavLink
              to="/admin/orders"
              className={navClass}
              onClick={toggleMobileMenu}
            >
              Orders
            </NavLink>
          </div>

          <div className="mt-4 border-t border-neutral-200 pt-4">
            {user && (
              <div className="mb-3 rounded-lg bg-neutral-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Signed in as
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-neutral-900">
                  {user.name}
                </p>
                <p className="truncate text-xs text-neutral-500">
                  {user.email}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}