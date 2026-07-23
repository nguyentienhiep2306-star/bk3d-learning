import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Alert } from '../components/ui'
import { useAuth } from '../features/auth/authContext'

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user, loading, isAdmin, profile } = useAuth()
  const location = useLocation()

  if (loading) return <div className="mx-auto max-w-5xl p-6">Đang kiểm tra phiên đăng nhập...</div>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
 if (profile?.is_active === false) return <Alert tone="error">Tài khoản đang bị khóa. Vui lòng liên hệ quản trị viên.</Alert>
  if (adminOnly && !isAdmin && profile !== null) return <Navigate to="/my-learning" replace />

  return <Outlet />
}
