import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import FullPageLoader from './ui/FullPageLoader'

export default function AdminRoute() {
  const { user, loading, isAuthenticated } = useAuth()

  // 1. MUST wait until restoreSession() in AuthContext sets loading to false
  if (loading) {
    return <FullPageLoader />
  }

  // 2. If not logged in after loading finishes, send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 3. Check for admin permissions (handling both role string and boolean flags)
  const isAdmin =
    user?.role === 'admin' ||
    (user as any)?.is_admin === true ||
    (user as any)?.is_admin === 1

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}