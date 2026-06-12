import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCaseStore } from '../../context/CaseStoreContext'
import modules from '../../data/modules.json'
import employees from '../../data/employees.json'
import DemoHeader from '../../components/DemoHeader'
import './DAdminCasesView.css'

const empMap = new Map(employees.map(e => [e.employee_id, e]))
const modMap  = new Map(modules.map(m => [m.module_id, m]))

function formatTs(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function pillLabel(status) {
  return status === 'fully_approved' ? 'FULLY APPROVED' : status.toUpperCase()
}

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
  const openCases   = moduleCases.filter(c => c.current_status === 'pending')
  const closedCases = moduleCases.filter(c =>
    c.current_status === 'fully_approved' || c.current_status === 'denied'
  )

  return (
    <div className="stub-root">
      <DemoHeader
        context="DEPT ADMIN // CASE MONITOR"
        backLabel="MODULES"
        backTo="/demo/admin"
      />

      <div className="rd-content">
        <div className="rd-top-bar">
          <div className="rd-title-block">
            <span className="rd-eyebrow">{mod.module_id} — TYPE {mod.module_type}</span>
            <h1 className="rd-title">{mod.module_name}</h1>
          </div>
        </div>

        <div className="dac-section">
          <div className="dac-section-header">
            <span className="dac-section-label">OPEN</span>
            <span className="dac-section-count">{openCases.length}</span>
          </div>
          <div className="dac-scroll-pane">
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
                {openCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="dac-td--empty">NO OPEN CASES FOR THIS MODULE.</td>
                  </tr>
                ) : openCases.map(c => {
                  const requestor       = empMap.get(c.requestor_id)
                  const currentApprover = c.approver_chain?.[c.current_approver_index]
                  const isAwaitingMe    = currentApprover?.eID === user.employee_id
                  const stepsRemaining  = (c.approver_chain?.length ?? 0) - c.current_approver_index

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
                      <td className="rd-td">{currentApprover?.roleLabel ?? '—'}</td>
                      <td className="rd-td dac-td--steps">{stepsRemaining}</td>
                      <td className="rd-td">
                        <span className="rd-pill rd-pill--pending">PENDING</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dac-section">
          <div className="dac-section-header">
            <span className="dac-section-label">CLOSED</span>
            <span className="dac-section-count">{closedCases.length}</span>
          </div>
          <div className="dac-scroll-pane">
            <table className="rd-table">
              <thead>
                <tr>
                  <th>CASE ID</th>
                  <th>REQUESTOR</th>
                  <th>TYPE</th>
                  <th>OUTCOME</th>
                  <th>CLOSED</th>
                </tr>
              </thead>
              <tbody>
                {closedCases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="dac-td--empty">NO CLOSED CASES FOR THIS MODULE.</td>
                  </tr>
                ) : closedCases.map(c => {
                  const requestor = empMap.get(c.requestor_id)

                  return (
                    <tr
                      key={c.case_id}
                      className="rd-case-row"
                      onClick={() => navigate(`/demo/admin/case/${c.case_id}`)}
                    >
                      <td className="rd-td rd-td--id">{c.case_id}</td>
                      <td className="rd-td">{requestor?.name ?? '—'}</td>
                      <td className="rd-td">{c.case_type}</td>
                      <td className="rd-td">
                        <span className={`rd-pill rd-pill--${c.current_status}`}>
                          {pillLabel(c.current_status)}
                        </span>
                      </td>
                      <td className="rd-td rd-td--date">
                        {formatTs(c.most_recent_timestamp)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
