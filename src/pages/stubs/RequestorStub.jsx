import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function RequestorStub() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/demo', { replace: true })
  }, [user, navigate])

  if (!user) return null

  return (
    <div className="stub-root">
      <div className="stub-header">
        <span className="stub-wordmark">FLUME</span>
        <button className="stub-back" onClick={() => navigate('/demo/dashboard')}>
          ← DASHBOARD
        </button>
      </div>
      <div className="stub-content">
        <h1 className="stub-title">REQUESTOR</h1>
        <p className="stub-note">view not yet built</p>
      </div>
    </div>
  )
}
