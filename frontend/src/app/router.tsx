import { Route, Routes } from 'react-router-dom'

import ProductsPage from '../pages/ProductsPage'
import ProductDetailsPage from '../pages/ProductDetailsPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'

import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import OrdersPage from '../pages/OrdersPage'
import OrderDetailsPage from '../pages/OrderDetailsPage'
import OrderSuccessPage from '../pages/OrderSuccessPage'
import AIAssistantPage from '../pages/AIAssistantPage'

import AdminDashboardPage from '../pages/AdminDashboardPage'
import AdminProductsPage from '../pages/AdminProductsPage'
import AdminCategoriesPage from '../pages/AdminCategoriesPage'
import AdminOrdersPage from '../pages/AdminOrdersPage'

import ProtectedRoute from '../components/ProtectedRoute'
import AdminRoute from '../components/AdminRoute'
import AppShell from '../components/layout/AppShell'

function HomePage() {
  return (
    <section>
      <h1>AI E-Commerce Platform</h1>
      <p>
        AI-powered product discovery and e-commerce.
      </p>
    </section>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
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
          <Route path="/cart" element={<CartPage />} />
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

        <Route element={<AdminRoute />}>
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
    </Routes>
  )
}