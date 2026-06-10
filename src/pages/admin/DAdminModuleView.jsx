import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import modules from '../../data/modules.json'
import './DAdminModuleView.css'

export default function DAdminModuleView() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  useEffect(() => {
    if (!user || user.role !== 'dAdmin') navigate('/demo', { replace: true })
  }, [user, navigate])

  if (!user || user.role !== 'dAdmin') return null

  const myModules = modules.filter(m => m.dadmin_id === user.employee_id)

  return (
    <div className="stub-root">
      <div className="stub-header">
        <span className="stub-wordmark">FLUME</span>
        <button className="stub-back" onClick={() => navigate('/demo/dashboard')}>
          ← ROLE SELECT
        </button>
      </div>

      <div className="rd-content">
        <div className="rd-top-bar">
          <h1 className="rd-title">Module Administration</h1>
        </div>

        {myModules.length === 0 ? (
          <div className="rd-empty">
            <span className="rd-empty-label">NO MODULES ASSIGNED.</span>
          </div>
        ) : (
          <div className="module-table-wrap">
            <table className="module-table">
              <thead>
                <tr>
                  <th>MODULE ID</th>
                  <th>NAME</th>
                  <th>TYPE</th>
                  <th>DELIVERY DATE</th>
                </tr>
              </thead>
              <tbody>
                {myModules.map(m => (
                  <tr
                    key={m.module_id}
                    className="module-row"
                    onClick={() => navigate(`/demo/admin/module/${m.module_id}`)}
                  >
                    <td>{m.module_id}</td>
                    <td>{m.module_name}</td>
                    <td>TYPE {m.module_type}</td>
                    <td>{m.delivery_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
