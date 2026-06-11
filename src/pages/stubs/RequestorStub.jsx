import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import modules from '../../data/modules.json'

export default function RequestorStub() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/demo', { replace: true })
  }, [user, navigate])

  if (!user) return null

  const eligible = modules.filter(m => m.allowed_staff_type === user.staff_type)

  return (
    <div className="stub-root">
      <div className="stub-header">
        <span className="stub-wordmark">FLUME</span>
        <button className="stub-back" onClick={() => navigate('/demo/dashboard')}>
          ← DASHBOARD
        </button>
      </div>
      <div className="requestor-content">
        <p className="requestor-section-label">SELECT MODULE</p>
        <div className="module-table-wrap">
          <table className="module-table">
            <thead>
              <tr>
                <th>MODULE ID</th>
                <th>MODULE NAME</th>
                <th>TYPE</th>
                <th>DELIVERY DATE</th>
              </tr>
            </thead>
            <tbody>
              {eligible.map(m => (
                <tr
                  key={m.module_id}
                  className="module-row"
                  onClick={() => navigate(`/demo/requestor/${m.module_id}`)}
                >
                  <td>{m.module_id}</td>
                  <td>{m.module_name}</td>
                  <td>{m.module_type}</td>
                  <td>{m.deployment_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
