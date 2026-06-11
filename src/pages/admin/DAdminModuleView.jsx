import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCaseStore } from '../../context/CaseStoreContext'
import modules from '../../data/modules.json'
import './DAdminModuleView.css'

export default function DAdminModuleView() {
  const { user }   = useAuth()
  const { cases }  = useCaseStore()
  const navigate   = useNavigate()
  const [tab, setTab] = useState('active')

  useEffect(() => {
    if (!user || user.role !== 'dAdmin') navigate('/demo', { replace: true })
  }, [user, navigate])

  if (!user || user.role !== 'dAdmin') return null

  const today         = new Date().toISOString().slice(0, 10)
  const myModules     = modules.filter(m => m.dadmin_id === user.employee_id)
  const activeModules = myModules.filter(m => m.delivery_date >= today)
  const pastModules   = myModules.filter(m => m.delivery_date < today)
  const visibleModules = tab === 'active' ? activeModules : pastModules

  function renderModuleTable(mods) {
    if (mods.length === 0) {
      return (
        <div className="rd-empty">
          <span className="rd-empty-label">NO {tab.toUpperCase()} MODULES.</span>
        </div>
      )
    }
    return (
      <div className="module-table-wrap">
        <table className="module-table">
          <thead>
            <tr>
              <th>MODULE ID</th>
              <th>NAME</th>
              <th>TYPE</th>
              <th>DELIVERY DATE</th>
              <th>PENDING</th>
            </tr>
          </thead>
          <tbody>
            {mods.map(m => {
              const moduleCases  = cases.filter(c => c.module_id === m.module_id)
              const pendingTotal = moduleCases.filter(c => c.current_status === 'pending').length
              const awaitingMe   = moduleCases.some(c =>
                c.current_status === 'pending' &&
                c.approver_chain?.[c.current_approver_index]?.eID === user.employee_id
              )

              return (
                <tr
                  key={m.module_id}
                  className={`module-row${awaitingMe ? ' module-row--pending' : ''}`}
                  onClick={() => navigate(`/demo/admin/module/${m.module_id}`)}
                >
                  <td>{m.module_id}</td>
                  <td>{m.module_name}</td>
                  <td>TYPE {m.module_type}</td>
                  <td>{m.delivery_date}</td>
                  <td className="dam-td--pending">
                    {pendingTotal > 0 ? pendingTotal : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

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

        <div className="dam-tabs">
          <button
            className={`dam-tab${tab === 'active' ? ' dam-tab--active' : ''}`}
            onClick={() => setTab('active')}
          >
            Active ({activeModules.length})
          </button>
          <button
            className={`dam-tab${tab === 'past' ? ' dam-tab--active' : ''}`}
            onClick={() => setTab('past')}
          >
            Past ({pastModules.length})
          </button>
        </div>

        {renderModuleTable(visibleModules)}
      </div>
    </div>
  )
}
