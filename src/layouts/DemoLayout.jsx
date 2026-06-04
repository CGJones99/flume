import { Outlet, Link } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'

export default function DemoLayout() {
  return (
    <AuthProvider>
      <Outlet />
      <Link to="/" className="demo-back-link">← RETURN TO PRD</Link>
    </AuthProvider>
  )
}
