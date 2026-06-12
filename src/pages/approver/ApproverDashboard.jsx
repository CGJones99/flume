import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCaseStore } from '../../context/CaseStoreContext'
import modules from '../../data/modules.json'
import employees from '../../data/employees.json'
import DemoHeader from '../../components/DemoHeader'
import './ApproverDashboard.css'

const empMap = new Map(employees.map(e => [e.employee_id, e]))
const modMap  = new Map(modules.map(m => [m.module_id, m]))

function formatTs(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ApproverDashboard() {
  const { user }  = useAuth()
  const { cases } = useCaseStore()
  const navigate  = useNavigate()

  useEffect(() => {
    if (!user) navigate('/demo', { replace: true })
  }, [user, navigate])

  if (!user) return null

  // Exclude cases where this user is acting as the dAdmin final signoff — those
  // belong to the MANAGE MODULES flow, not the standard approver queue.
  const pendingCases = cases.filter(c =>
    c.current_status === 'pending' &&
    c.approver_chain?.[c.current_approver_index]?.eID === user.employee_id &&
    c.approver_chain?.[c.current_approver_index]?.roleLabel !== 'Dept Admin'
  )

  return (
    <div className="stub-root">
      <DemoHeader
        context="APPROVER // DECISION QUEUE"
        backLabel="ROLE SELECT"
        backTo="/demo/dashboard"
      />

      <div className="rd-content">
        <div className="rd-top-bar">
          <div className="rd-title-block">
            <span className="rd-eyebrow">AWAITING YOUR ACTION</span>
            <h1 className="rd-title">Pending Decisions</h1>
          </div>
        </div>

        {pendingCases.length === 0 ? (
          <div className="rd-empty">
            <span className="rd-empty-label">NO PENDING CASES.</span>
          </div>
        ) : (
          <div className="rd-table-wrap">
            <table className="rd-table">
              <thead>
                <tr>
                  <th></th>
                  <th>CASE ID</th>
                  <th>MODULE</th>
                  <th>TYPE</th>
                  <th>REQUESTOR</th>
                  <th>ROLE</th>
                  <th>SUBMITTED</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {pendingCases.map(c => {
                  const mod       = modMap.get(c.module_id)
                  const requestor = empMap.get(c.requestor_id)

                  return (
                    <tr
                      key={c.case_id}
                      className="rd-case-row"
                      onClick={() => navigate(`/demo/approver/case/${c.case_id}`)}
                    >
                      <td className="rd-td rd-td--expander">
                        <span className="rd-expander">{'>'}</span>
                      </td>
                      <td className="rd-td rd-td--id">{c.case_id}</td>
                      <td className="rd-td">{mod?.module_name ?? c.module_id}</td>
                      <td className="rd-td">{c.case_type}</td>
                      <td className="rd-td">{requestor?.name ?? '—'}</td>
                      <td className="rd-td ad-td--role">{requestor?.role ?? '—'}</td>
                      <td className="rd-td rd-td--date">{formatTs(c.initial_timestamp)}</td>
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
