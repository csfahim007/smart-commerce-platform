import { useState } from 'react'
import {
  BarChart3,
  Boxes,
  ClipboardList,
  FolderTree,
  LogOut,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import AdminHeader from './AdminHeader'

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

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function handleLogout() {
    await logout()
  }

  async function handleRefresh() {
    setIsRefreshing(true)
    // Refetches all React Query cache data for the current view
    await queryClient.invalidateQueries()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-5">
              <Link
                to="/admin"
                className="flex items-center gap-2 font-bold tracking-tight"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-xs text-white">
                  AI
                </span>

                <span>Commerce Admin</span>
              </Link>

              {/* 🌟 Refresh Button */}
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh Page Data"
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 transition"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isRefreshing ? 'animate-spin text-neutral-950' : ''
                  }`}
                />
              </button>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              <NavLink
                end
                to="/admin"
                className={navClass}
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </NavLink>

              <NavLink
                to="/admin/products"
                className={navClass}
              >
                <Boxes className="h-4 w-4" />
                Products
              </NavLink>

              <NavLink
                to="/admin/categories"
                className={navClass}
              >
                <FolderTree className="h-4 w-4" />
                Categories
              </NavLink>

              <NavLink
                to="/admin/orders"
                className={navClass}
              >
                <ClipboardList className="h-4 w-4" />
                Orders
              </NavLink>
            </nav>

            <div className="border-t border-neutral-200 p-4">
              <div className="mb-3 rounded-lg bg-neutral-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Signed in as
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-neutral-900">
                  {user?.name}
                </p>

                <p className="truncate text-xs text-neutral-500">
                  {user?.email}
                </p>
              </div>

              <div className="space-y-1">
                <Link
                  to="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Storefront
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <AdminHeader />

          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}