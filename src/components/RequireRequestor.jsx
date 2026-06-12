import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/*
 * Route guard for the requestor flow.
 *
 * The requestor tile is already hidden on the role-select screen for admins
 * (staff_type "admin" — see RoleDashboard), but the /demo/requestor/* routes
 * are still reachable by direct URL. Admins are supervisory only: they have no
 * eligible module to raise a case against, so the module selector and form are
 * a dead end for them. This guard closes that path off entirely — no signed-in
 * user falls back to login, an admin falls back to their role-select screen.
 */
export default function RequireRequestor() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/demo" replace />
  if (user.staff_type === 'admin') return <Navigate to="/demo/dashboard" replace />

  return <Outlet />
}
