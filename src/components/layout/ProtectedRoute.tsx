import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/context'
import { FullPageSpinner } from '../ui/spinner'

export function ProtectedRoute() {
  const { loading, session, needsOnboarding } = useAuth()

  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace />
  if (needsOnboarding) return <Navigate to="/onboarding" replace />

  return <Outlet />
}
