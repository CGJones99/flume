import { Outlet, Link } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { CaseStoreProvider } from '../context/CaseStoreContext'

export default function DemoLayout() {
  return (
    <AuthProvider>
      <CaseStoreProvider>
        <Outlet />
        <Link to="/" className="demo-back-link">← RETURN TO PRD</Link>
      </CaseStoreProvider>
    </AuthProvider>
  )
}
