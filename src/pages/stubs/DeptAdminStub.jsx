import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DemoHeader from '../../components/DemoHeader'

export default function DeptAdminStub() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/demo', { replace: true })
  }, [user, navigate])

  if (!user) return null

  return (
    <div className="stub-root">
      <DemoHeader
        context="DEPT ADMIN"
        backLabel="DASHBOARD"
        backTo="/demo/dashboard"
      />
      <div className="stub-content">
        <h1 className="stub-title">DEPT ADMIN</h1>
        <p className="stub-note">view not yet built</p>
      </div>
    </div>
  )
}
