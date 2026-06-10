import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCaseStore } from '../../context/CaseStoreContext'
import modules from '../../data/modules.json'
import employees from '../../data/employees.json'
import './DAdminCasesView.css'

const empMap = new Map(employees.map(e => [e.employee_id, e]))
const modMap  = new Map(modules.map(m => [m.module_id, m]))

export default function DAdminCasesView() {
  const { moduleId } = useParams()
  const { user }     = useAuth()
  const { cases }    = useCaseStore()
  const navigate     = useNavigate()

  useEffect(() => {
    if (!user || user.role !== 'dAdmin') navigate('/demo', { replace: true })
  }, [user, navigate])

  if (!user || user.role !== 'dAdmin') return null

  const mod = modMap.get(moduleId)

  if (!mod || mod.dadmin_id !== user.employee_id) {
    navigate('/demo/admin', { replace: true })
    return null
  }

  const moduleCases = cases.filter(c => c.module_id === moduleId)

  return (
    <div className="stub-root">
      <div className="stub-header">
        <span className="stub-wordmark">FLUME</span>
        <button className="stub-back" onClick={() => navigate('/demo/admin')}>
          ← MODULES
        </button>
      </div>

      <div className="rd-content">
        <div className="rd-top-bar">
          <h1 className="rd-title">{mod.module_name}</h1>
          <span className="dac-module-meta">
            {mod.module_id} — TYPE {mod.module_type}
          </span>
        </div>

        {moduleCases.length === 0 ? (
          <div className="rd-empty">
            <span className="rd-empty-label">NO CASES FOR THIS MODULE.</span>
          </div>
        ) : (
          <div className="rd-table-wrap">
            <table className="rd-table">
              <thead>
                <tr>
                  <th></th>
                  <th>CASE ID</th>
                  <th>REQUESTOR</th>
                  <th>TYPE</th>
                  <th>CURRENT STEP</th>
                  <th>STEPS REMAINING</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {moduleCases.map(c => {
                  const requestor       = empMap.get(c.requestor_id)
                  const currentApprover = c.approver_chain?.[c.current_approver_index]
                  const isAwaitingMe    = (
                    c.current_status === 'pending' &&
                    currentApprover?.eID === user.employee_id
                  )
                  const stepsRemaining  = c.current_status === 'pending'
                    ? (c.approver_chain?.length ?? 0) - c.current_approver_index
                    : 0

                  return (
                    <tr
                      key={c.case_id}
                      className={`rd-case-row${isAwaitingMe ? ' dac-row--awaiting' : ''}`}
                      onClick={() => navigate(`/demo/admin/case/${c.case_id}`)}
                    >
                      <td className="rd-td rd-td--expander">
                        <span className={`rd-expander${isAwaitingMe ? ' dac-expander--awaiting' : ''}`}>
                          {isAwaitingMe ? '!' : '>'}
                        </span>
                      </td>
                      <td className="rd-td rd-td--id">{c.case_id}</td>
                      <td className="rd-td">{requestor?.name ?? '—'}</td>
                      <td className="rd-td">{c.case_type}</td>
                      <td className="rd-td">
                        {c.current_status === 'pending'
                          ? (currentApprover?.roleLabel ?? '—')
                          : '—'}
                      </td>
                      <td className="rd-td dac-td--steps">
                        {c.current_status === 'pending' ? stepsRemaining : '—'}
                      </td>
                      <td className="rd-td">
                        <span className={`rd-pill rd-pill--${c.current_status}`}>
                          {c.current_status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
