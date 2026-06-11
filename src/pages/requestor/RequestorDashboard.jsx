import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCaseStore } from '../../context/CaseStoreContext'
import { useRequestorRead } from '../../context/RequestorReadContext'
import modules from '../../data/modules.json'
import employees from '../../data/employees.json'

const empMap = new Map(employees.map(e => [e.employee_id, e]))
const modMap  = new Map(modules.map(m => [m.module_id, m]))

const EVENT_LABELS = {
  submission:         'Submitted',
  notification_sent:  'Notification Sent',
  approved:           'Approved',
  denied:             'Denied',
}

function resolveActor(actorId, caseRecord) {
  if (actorId === 'SYSTEM') return { name: 'System', roleLabel: 'System' }
  const emp = empMap.get(actorId)
  if (actorId === caseRecord.requestor_id) {
    return { name: emp?.name ?? '—', roleLabel: 'Requestor' }
  }
  return { name: emp?.name ?? '—', roleLabel: emp?.role ?? '—' }
}

function formatTs(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function pastPillLabel(status) {
  return status === 'fully_approved' ? 'APPROVED' : 'DENIED'
}

export default function RequestorDashboard() {
  const { user }                             = useAuth()
  const { cases, events }                    = useCaseStore()
  const { readCaseIds, markRead, markAllRead } = useRequestorRead()
  const navigate                             = useNavigate()
  const [expandedId, setExpandedId]          = useState(null)

  useEffect(() => {
    if (!user) navigate('/demo', { replace: true })
  }, [user, navigate])

  // S-R8: On arrival, mark all currently-closed cases as tile-acknowledged.
  // Empty deps is intentional — this fires once at mount. Cases that close
  // after the user lands here will row-pulse but won't re-clear the tile
  // until the next visit, which is the desired behavior.
  useEffect(() => {
    if (!user) return
    const pastIds = cases
      .filter(c =>
        c.requestor_id === user.employee_id &&
        (c.current_status === 'fully_approved' || c.current_status === 'denied')
      )
      .map(c => c.case_id)
    if (pastIds.length > 0) markAllRead(pastIds)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null

  const myCases     = cases.filter(c => c.requestor_id === user.employee_id)
  const activeCases = myCases.filter(c => c.current_status === 'pending')
  const pastCases   = myCases.filter(c =>
    c.current_status === 'fully_approved' || c.current_status === 'denied'
  )

  function toggleExpand(caseId) {
    setExpandedId(prev => prev === caseId ? null : caseId)
  }

  function toggleExpandPast(caseId) {
    markRead(caseId)
    setExpandedId(prev => prev === caseId ? null : caseId)
  }

  function caseEvents(caseId) {
    return events
      .filter(e => e.case_id === caseId)
      .sort((a, b) => a.sequence_number - b.sequence_number)
  }

  function renderAuditLog(c, colSpan) {
    return (
      <tr className="rd-log-row">
        <td colSpan={colSpan} className="rd-log-cell">
          <div className="rd-log">
            <p className="rd-log-heading">AUDIT LOG</p>
            <div className="rd-log-entries">
              {caseEvents(c.case_id).map(evt => {
                const actor   = resolveActor(evt.actor_id, c)
                const isNotif = evt.event_type === 'notification_sent'
                return (
                  <div key={evt.event_id} className="rd-log-entry">
                    <div className="rd-log-meta">
                      <span className="rd-log-actor">{actor.name}</span>
                      <span className="rd-log-role">{actor.roleLabel}</span>
                      <span className="rd-log-type">
                        {EVENT_LABELS[evt.event_type] ?? evt.event_type}
                      </span>
                      <span className="rd-log-ts">{formatTs(evt.timestamp)}</span>
                    </div>
                    {evt.reason && (
                      <p className="rd-log-reason">{evt.reason}</p>
                    )}
                    {isNotif && (
                      <div className="rd-teams-callout">
                        PRODUCTION: MICROSOFT TEAMS
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </td>
      </tr>
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
          <h1 className="rd-title">Current Cancellation Requests</h1>
          <button className="rd-create-btn" onClick={() => navigate('/demo/requestor')}>
            Create a Case
          </button>
        </div>

        {/* Active cases — unchanged from S-R4 */}
        {activeCases.length === 0 ? (
          <div className="rd-empty">
            <span className="rd-empty-label">NO ACTIVE CASES.</span>
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
                  <th>SUBMITTED</th>
                  <th>DELIVERY</th>
                  <th>STATUS</th>
                  <th>CURRENT HOLDER</th>
                </tr>
              </thead>
              <tbody>
                {activeCases.map(c => {
                  const mod      = modMap.get(c.module_id)
                  const holder   = c.approver_chain[c.current_approver_index]
                  const expanded = expandedId === c.case_id

                  return (
                    <React.Fragment key={c.case_id}>
                      <tr
                        className={`rd-case-row${expanded ? ' rd-case-row--open' : ''}`}
                        onClick={() => toggleExpand(c.case_id)}
                      >
                        <td className="rd-td rd-td--expander">
                          <span className="rd-expander">{expanded ? '−' : '+'}</span>
                        </td>
                        <td className="rd-td rd-td--id">{c.case_id}</td>
                        <td className="rd-td">{mod?.module_name ?? c.module_id}</td>
                        <td className="rd-td">{c.case_type}</td>
                        <td className="rd-td rd-td--date">{formatTs(c.initial_timestamp)}</td>
                        <td className="rd-td rd-td--date">{mod?.deployment_date ?? '—'}</td>
                        <td className="rd-td">
                          <span className={`rd-pill rd-pill--${c.current_status}`}>
                            {c.current_status.toUpperCase()}
                          </span>
                        </td>
                        <td className="rd-td">
                          {holder ? (
                            <>
                              <span className="rd-holder-name">{holder.fullName}</span>
                              <span className="rd-holder-role">{holder.roleLabel}</span>
                            </>
                          ) : (
                            <span className="rd-muted">—</span>
                          )}
                        </td>
                      </tr>
                      {expanded && renderAuditLog(c, 8)}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Past cases — S-R7 */}
        <div className="rd-section">
          <div className="rd-section-header">
            <span className="rd-section-label">PAST CASES</span>
            <span className="rd-section-count">{pastCases.length}</span>
          </div>
          <div className="rd-section-scroll">
            <table className="rd-table">
              <thead>
                <tr>
                  <th></th>
                  <th>CASE ID</th>
                  <th>MODULE</th>
                  <th>TYPE</th>
                  <th>SUBMITTED</th>
                  <th>CLOSED</th>
                  <th>OUTCOME</th>
                </tr>
              </thead>
              <tbody>
                {pastCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="rd-td rd-td--empty">NO PAST CASES.</td>
                  </tr>
                ) : pastCases.map(c => {
                  const mod      = modMap.get(c.module_id)
                  const expanded = expandedId === c.case_id
                  const isUnread = !readCaseIds.has(c.case_id)

                  return (
                    <React.Fragment key={c.case_id}>
                      <tr
                        className={[
                          'rd-case-row',
                          expanded  ? 'rd-case-row--open'    : '',
                          isUnread  ? 'rd-past-row--unread'  : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => toggleExpandPast(c.case_id)}
                      >
                        <td className="rd-td rd-td--expander">
                          <span className="rd-expander">{expanded ? '−' : '+'}</span>
                        </td>
                        <td className="rd-td rd-td--id">{c.case_id}</td>
                        <td className="rd-td">{mod?.module_name ?? c.module_id}</td>
                        <td className="rd-td">{c.case_type}</td>
                        <td className="rd-td rd-td--date">{formatTs(c.initial_timestamp)}</td>
                        <td className="rd-td rd-td--date">{formatTs(c.most_recent_timestamp)}</td>
                        <td className="rd-td">
                          <span className={`rd-pill rd-pill--${c.current_status}`}>
                            {pastPillLabel(c.current_status)}
                          </span>
                        </td>
                      </tr>
                      {expanded && renderAuditLog(c, 7)}
                    </React.Fragment>
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
