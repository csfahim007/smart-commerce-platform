import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import './styles/globals.css'
import HomePage from './pages/HomePage'
import { queryClient } from './lib/query-client'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

import AppShell from './components/layout/AppShell'
import StorefrontLayout from './components/layout/StorefrontLayout'
import AdminLayout from './components/layout/AdminLayout'

import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import RouteLoader from './components/ui/RouteLoader'

const ProductsPage = lazy(
  () => import('./pages/ProductsPage'),
)

const ProductDetailsPage = lazy(
  () => import('./pages/ProductDetailsPage'),
)

const LoginPage = lazy(
  () => import('./pages/LoginPage'),
)

const RegisterPage = lazy(
  () => import('./pages/RegisterPage'),
)

const CartPage = lazy(
  () => import('./pages/CartPage'),
)

const CheckoutPage = lazy(
  () => import('./pages/CheckoutPage'),
)

const OrdersPage = lazy(
  () => import('./pages/OrdersPage'),
)

const OrderDetailsPage = lazy(
  () => import('./pages/OrderDetailsPage'),
)

const OrderSuccessPage = lazy(
  () => import('./pages/OrderSuccessPage'),
)

const AIAssistantPage = lazy(
  () => import('./pages/AIAssistantPage'),
)

const NotFoundPage = lazy(
  () => import('./pages/NotFoundPage'),
)

const AdminDashboardPage = lazy(
  () => import('./pages/AdminDashboardPage'),
)

const AdminProductsPage = lazy(
  () => import('./pages/AdminProductsPage'),
)

const AdminCategoriesPage = lazy(
  () => import('./pages/AdminCategoriesPage'),
)

const AdminOrdersPage = lazy(
  () => import('./pages/AdminOrdersPage'),
)



function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<HomePage />} />

            <Route
              path="/products"
              element={<ProductsPage />}
            />

            <Route
              path="/products/:id"
              element={<ProductDetailsPage />}
            />

            <Route
              path="/login"
              element={<LoginPage />}
            />

            <Route
              path="/register"
              element={<RegisterPage />}
            />

            <Route element={<ProtectedRoute />}>
              <Route
                path="/cart"
                element={<CartPage />}
              />

              <Route
                path="/checkout"
                element={<CheckoutPage />}
              />

              <Route
                path="/orders"
                element={<OrdersPage />}
              />

              <Route
                path="/orders/:id"
                element={<OrderDetailsPage />}
              />

              <Route
                path="/order-success"
                element={<OrderSuccessPage />}
              />

              <Route
                path="/ai-assistant"
                element={<AIAssistantPage />}
              />
            </Route>

            <Route
              path="*"
              element={<NotFoundPage />}
            />
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route
                path="/admin"
                element={<AdminDashboardPage />}
              />

              <Route
                path="/admin/products"
                element={<AdminProductsPage />}
              />

              <Route
                path="/admin/categories"
                element={<AdminCategoriesPage />}
              />

              <Route
                path="/admin/orders"
                element={<AdminOrdersPage />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

ReactDOM.createRoot(
  document.getElementById('root')!,
).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
