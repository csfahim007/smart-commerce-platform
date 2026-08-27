import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import FullPageLoader from './ui/FullPageLoader'

export default function ProtectedRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAuth()

  const location = useLocation()

  if (loading) {
    return <FullPageLoader />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}
