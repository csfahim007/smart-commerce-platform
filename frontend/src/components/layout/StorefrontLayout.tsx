import { Outlet } from 'react-router-dom'
import StorefrontHeader from './StorefrontHeader'
import CartDrawer from '../commerce/CartDrawer'

export default function StorefrontLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-950">
      <StorefrontHeader />

      <CartDrawer />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
