import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCaseStore } from '../../context/CaseStoreContext'
import modules from '../../data/modules.json'
import employees from '../../data/employees.json'
import './ApproverCaseView.css'

const empMap = new Map(employees.map(e => [e.employee_id, e]))
const modMap  = new Map(modules.map(m => [m.module_id, m]))

const EVENT_LABELS = {
  submission:        'Submitted',
  notification_sent: 'Notification Sent',
  approved:          'Approved',
  denied:            'Denied',
}

function formatTs(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function resolveActor(actorId, requestorId) {
  if (actorId === 'SYSTEM') return { name: 'SYSTEM', roleLabel: null }
  const emp = empMap.get(actorId)
  if (actorId === requestorId) {
    return { name: emp?.name ?? '—', roleLabel: 'Requestor' }
  }
  return { name: emp?.name ?? '—', roleLabel: emp?.role ?? '—' }
}

export default function ApproverCaseView() {
  const { caseId }  = useParams()
  const { user }    = useAuth()
  const { cases, events, appendEvent, updateCase } = useCaseStore()
  const navigate    = useNavigate()

  const [decision, setDecision] = useState(null) // 'approved' | 'denied' | null
  const [reason,   setReason]   = useState('')

  const caseRecord  = cases.find(c => c.case_id === caseId)

  useEffect(() => {
    if (!user)        navigate('/demo',   { replace: true })
    else if (!caseRecord) navigate('/demo', { replace: true })
  }, [user, caseRecord, navigate])

  if (!user || !caseRecord) return null

  const mod       = modMap.get(caseRecord.module_id)
  const requestor = empMap.get(caseRecord.requestor_id)

  const caseEvents = events
    .filter(e => e.case_id === caseId)
    .sort((a, b) => a.sequence_number - b.sequence_number)

  const reasonLength   = reason.length
  const showHelper     = reasonLength > 0 && reasonLength < 100
  const canSubmit      = decision !== null && reasonLength >= 100

  function getHint() {
    if (!decision && reasonLength < 100) return 'SELECT A DECISION AND ENTER A REASON — MIN 100 CHARS'
    if (!decision)                        return 'SELECT A DECISION TO SUBMIT'
    if (reasonLength < 100)               return `REASON TOO SHORT — ${reasonLength} / 100 CHARS`
    return null
  }

  function handleToggle(value) {
    setDecision(prev => prev === value ? null : value)
  }

  function handleSubmit() {
    if (!canSubmit) return

    const now     = new Date().toISOString()
    const lastSeq = caseEvents.length > 0
      ? caseEvents[caseEvents.length - 1].sequence_number
      : -1

    appendEvent({
      case_id:         caseId,
      actor_id:        user.employee_id,
      event_type:      decision,
      sequence_number: lastSeq + 1,
      timestamp:       now,
      reason,
    })

    const nextIndex = caseRecord.current_approver_index + 1
    const nextApprover = caseRecord.approver_chain[nextIndex]

    let notifyText
    if (decision === 'approved') {
      notifyText = nextApprover
        ? `Notification sent to ${nextApprover.fullName} (${nextApprover.roleLabel}). Production: Microsoft Teams.`
        : `Case fully approved — no further approvers in chain. Production: Microsoft Teams.`
    } else {
      const reqName = requestor?.name ?? '—'
      notifyText = `Case denied. Requestor ${reqName} notified. Production: Microsoft Teams.`
    }

    appendEvent({
      case_id:         caseId,
      actor_id:        'SYSTEM',
      event_type:      'notification_sent',
      sequence_number: lastSeq + 2,
      timestamp:       now,
      reason:          notifyText,
    })

    if (decision === 'approved' && nextIndex < caseRecord.approver_chain.length) {
      updateCase(caseId, {
        current_approver_index: nextIndex,
        most_recent_action:     'approved',
        most_recent_timestamp:  now,
      })
    } else if (decision === 'denied') {
      updateCase(caseId, {
        current_status:        'denied',
        most_recent_action:    'denied',
        most_recent_timestamp: now,
      })
    }

    navigate('/demo/approver/dashboard')
  }

  const hint = getHint()

  return (
    <div className="acv-root">
      <div className="stub-header">
        <span className="stub-wordmark">FLUME</span>
        <button className="stub-back" onClick={() => navigate('/demo/approver/dashboard')}>
          ← PENDING CASES
        </button>
      </div>

      <div className="acv-body">

        {/* ── Left column ─────────────────────────────────── */}
        <div className="acv-left">

          <section className="acv-section">
            <h2 className="acv-section-heading">Case Details</h2>
            <div className="acv-detail-table">

              <div className="acv-row">
                <span className="acv-row-label">Case ID</span>
                <span className="acv-row-value acv-row-value--id">{caseRecord.case_id}</span>
              </div>
              <div className="acv-row">
                <span className="acv-row-label">Submitted</span>
                <span className="acv-row-value">{formatTs(caseRecord.initial_timestamp)}</span>
              </div>

              <div className="acv-divider" />

              <div className="acv-row">
                <span className="acv-row-label">Module ID</span>
                <span className="acv-row-value acv-row-value--id">{caseRecord.module_id}</span>
              </div>
              <div className="acv-row">
                <span className="acv-row-label">Module Name</span>
                <span className="acv-row-value">{mod?.module_name ?? '—'}</span>
              </div>
              <div className="acv-row">
                <span className="acv-row-label">Module Type</span>
                <span className="acv-row-value acv-row-value--tag">TYPE {mod?.module_type ?? '—'}</span>
              </div>

              <div className="acv-divider" />

              <div className="acv-row">
                <span className="acv-row-label">Case Type</span>
                <span className="acv-row-value">{caseRecord.case_type}</span>
              </div>
              <div className="acv-row">
                <span className="acv-row-label">Requestor</span>
                <span className="acv-row-value">{requestor?.name ?? '—'}</span>
              </div>
              <div className="acv-row">
                <span className="acv-row-label">Requestor Role</span>
                <span className="acv-row-value acv-row-value--role">{requestor?.role ?? '—'}</span>
              </div>

              {mod?.module_type === 'B' && (
                <div className="acv-row">
                  <span className="acv-row-label">Early Flag</span>
                  <span className={`acv-row-value acv-row-value--flag${caseRecord.early_flag ? ' acv-row-value--flag-active' : ''}`}>
                    {caseRecord.early_flag ? 'YES — RULE 5 APPLIED' : 'NO'}
                  </span>
                </div>
              )}

              <div className="acv-divider" />

              <div className="acv-row acv-row--block">
                <span className="acv-row-label">Reason</span>
                <p className="acv-reason-body">{caseRecord.requestor_reason}</p>
              </div>

            </div>
          </section>

          <section className="acv-section">
            <h2 className="acv-section-heading">Case History</h2>
            <div className="acv-history">
              {caseEvents.length === 0 ? (
                <p className="acv-history-empty">NO EVENTS RECORDED.</p>
              ) : (
                <div className="acv-history-entries">
                  {caseEvents.map(evt => {
                    const actor   = resolveActor(evt.actor_id, caseRecord.requestor_id)
                    const isNotif = evt.event_type === 'notification_sent'
                    return (
                      <div key={evt.event_id} className="acv-history-entry">
                        <div className="acv-history-meta">
                          <span className="acv-history-actor">{actor.name}</span>
                          {actor.roleLabel && (
                            <span className="acv-history-role">{actor.roleLabel}</span>
                          )}
                          <span className="acv-history-type">
                            {EVENT_LABELS[evt.event_type] ?? evt.event_type}
                          </span>
                          <span className="acv-history-ts">{formatTs(evt.timestamp)}</span>
                        </div>
                        {evt.reason && (
                          <p className="acv-history-reason">{evt.reason}</p>
                        )}
                        {isNotif && (
                          <div className="acv-teams-callout">PRODUCTION: MICROSOFT TEAMS</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

        </div>

        {/* ── Right column — Decision Panel ───────────────── */}
        <div className="acv-right">
          <div className="acv-panel">

            <h2 className="acv-panel-heading">Decision</h2>

            <div className="acv-toggles">
              <button
                type="button"
                className={`acv-toggle acv-toggle--approve${decision === 'approved' ? ' acv-toggle--active-approve' : ''}`}
                onClick={() => handleToggle('approved')}
              >
                APPROVE
              </button>
              <button
                type="button"
                className={`acv-toggle acv-toggle--deny${decision === 'denied' ? ' acv-toggle--active-deny' : ''}`}
                onClick={() => handleToggle('denied')}
              >
                DENY
              </button>
            </div>

            <div className="acv-reason-field">
              <label className="acv-reason-label" htmlFor="acv-reason">
                Approver Reasoning
              </label>
              <textarea
                id="acv-reason"
                className="acv-reason-textarea"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Minimum 100 characters required."
                rows={6}
              />
              <span className={`acv-char-count${reasonLength >= 100 ? ' acv-char-count--met' : ''}`}>
                {reasonLength} / 100
              </span>
              {showHelper && (
                <span className="acv-reason-helper">Response length not met to submit.</span>
              )}
            </div>

            <div className="acv-submit-area">
              <button
                type="button"
                className={`acv-submit-btn${canSubmit ? ' acv-submit-btn--active' : ''}`}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Submit Decision
              </button>
              {!canSubmit && hint && (
                <span className="acv-hint">{hint}</span>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
