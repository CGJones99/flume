import { Outlet, Link, useNavigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { CaseStoreProvider } from '../context/CaseStoreContext'
import { useAuth } from '../context/AuthContext'

function DemoChrome() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/demo', { replace: true })
  }

  return (
    <>
      <Outlet />
      <Link to="/" className="demo-back-link">← RETURN TO PRD</Link>
      {user && (
        <button className="demo-logout-btn" onClick={handleLogout}>
          SIGN OUT
        </button>
      )}
    </>
  )
}

export default function DemoLayout() {
  return (
    <AuthProvider>
      <CaseStoreProvider>
        <DemoChrome />
      </CaseStoreProvider>
    </AuthProvider>
  )
}
