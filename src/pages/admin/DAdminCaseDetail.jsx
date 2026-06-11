import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCaseStore } from '../../context/CaseStoreContext'
import CaseHistory from '../../components/CaseHistory'
import modules from '../../data/modules.json'
import employees from '../../data/employees.json'
import '../approver/ApproverCaseView.css'
import './DAdminCaseDetail.css'

const empMap = new Map(employees.map(e => [e.employee_id, e]))
const modMap  = new Map(modules.map(m => [m.module_id, m]))

function formatTs(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function DAdminCaseDetail() {
  const { caseId }  = useParams()
  const { user }    = useAuth()
  const { cases, events, appendEvent, updateCase } = useCaseStore()
  const navigate    = useNavigate()

  const [decision,          setDecision]          = useState(null) // 'approved' | 'denied' | null
  const [approvalPath,      setApprovalPath]      = useState('')
  const [allocationChecked, setAllocationChecked] = useState(false)
  const [denialReason,      setDenialReason]      = useState('')

  const caseRecord = cases.find(c => c.case_id === caseId)

  useEffect(() => {
    if (!user || user.role !== 'dAdmin') navigate('/demo',       { replace: true })
    else if (!caseRecord)               navigate('/demo/admin',  { replace: true })
  }, [user, caseRecord, navigate])

  if (!user || user.role !== 'dAdmin' || !caseRecord) return null

  const mod       = modMap.get(caseRecord.module_id)
  const requestor = empMap.get(caseRecord.requestor_id)

  const caseEvents = events
    .filter(e => e.case_id === caseId)
    .sort((a, b) => a.sequence_number - b.sequence_number)

  const isMyTurn = (
    caseRecord.current_status === 'pending' &&
    caseRecord.approver_chain?.[caseRecord.current_approver_index]?.eID === user.employee_id
  )

  const denialLength = denialReason.length
  const showDenialHelper = denialLength > 0 && denialLength < 200

  const canSubmit = decision === 'approved'
    ? approvalPath !== '' && allocationChecked
    : decision === 'denied'
      ? denialLength >= 200
      : false

  function getHint() {
    if (!decision)                                             return 'SELECT APPROVE OR DENY'
    if (decision === 'approved' && approvalPath === '')        return 'SELECT AN APPROVAL PATH'
    if (decision === 'approved' && !allocationChecked)         return 'CONFIRM ALLOCATION SYSTEM ACTION'
    if (decision === 'denied' && denialLength < 200)           return `REASON TOO SHORT — ${denialLength} / 200 CHARS`
    return null
  }

  function handleToggle(value) {
    setDecision(prev => prev === value ? null : value)
  }

  function handleSubmit() {
    if (!canSubmit || !isMyTurn) return

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
      reason:          decision === 'approved' ? approvalPath : denialReason,
    })

    const notifyText = decision === 'approved'
      ? `Case fully approved by dAdmin ${user.employee_id}. Path: ${approvalPath}. Production: Microsoft Teams.`
      : `Case denied. Requestor ${requestor?.name ?? '—'} notified. Production: Microsoft Teams.`

    appendEvent({
      case_id:         caseId,
      actor_id:        'SYSTEM',
      event_type:      'notification_sent',
      sequence_number: lastSeq + 2,
      timestamp:       now,
      reason:          notifyText,
    })

    updateCase(caseId, {
      current_status:        decision === 'approved' ? 'fully_approved' : 'denied',
      most_recent_action:    decision,
      most_recent_timestamp: now,
    })

    navigate(`/demo/admin/module/${caseRecord.module_id}`)
  }

  const hint = getHint()

  return (
    <div className="acv-root">
      <div className="stub-header">
        <span className="stub-wordmark">FLUME</span>
        <button
          className="stub-back"
          onClick={() => navigate(`/demo/admin/module/${caseRecord.module_id}`)}
        >
          ← {mod?.module_name ?? 'MODULE'}
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
                <span className="acv-row-label">Requestor eID</span>
                <span className="acv-row-value acv-row-value--id">{caseRecord.requestor_id}</span>
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
            <h2 className="acv-section-heading">Audit Log</h2>
            <CaseHistory
              caseRecord={caseRecord}
              caseEvents={caseEvents}
              showEid={true}
            />
          </section>

        </div>

        {/* ── Right column — signoff panel (only when it's the dAdmin's turn) ── */}
        {isMyTurn && (
          <div className="acv-right">
            <div className="acv-panel">

              <h2 className="acv-panel-heading">Final Signoff</h2>

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

              {/* Approval path fields */}
              {decision === 'approved' && (
                <div className="dac-approval-fields">

                  <div className="dac-dropdown-wrapper">
                    <label className="dac-field-label" htmlFor="dac-approval-path">
                      Approval Path
                    </label>
                    <select
                      id="dac-approval-path"
                      className="dac-dropdown"
                      value={approvalPath}
                      onChange={e => setApprovalPath(e.target.value)}
                    >
                      <option value="" disabled>Select path...</option>
                      <option value="policy_satisfied">Policy Satisfied</option>
                      <option value="expedited">Expedited</option>
                      <option value="special_case">Special Case</option>
                    </select>
                  </div>

                  <label className="dac-checkbox-row">
                    <input
                      type="checkbox"
                      className="dac-checkbox-input"
                      checked={allocationChecked}
                      onChange={e => setAllocationChecked(e.target.checked)}
                    />
                    <span className="dac-checkbox-label">
                      I have processed the cancellation in the allocation system
                    </span>
                  </label>

                </div>
              )}

              {/* Denial path fields */}
              {decision === 'denied' && (
                <div className="acv-reason-field">
                  <label className="acv-reason-label" htmlFor="dac-denial-reason">
                    Denial Reasoning
                  </label>
                  <textarea
                    id="dac-denial-reason"
                    className="acv-reason-textarea"
                    value={denialReason}
                    onChange={e => setDenialReason(e.target.value)}
                    placeholder="Minimum 200 characters required."
                    rows={7}
                  />
                  <span className={`acv-char-count${denialLength >= 200 ? ' acv-char-count--met' : ''}`}>
                    {denialLength} / 200
                  </span>
                  {showDenialHelper && (
                    <span className="acv-reason-helper">Response length not met to submit.</span>
                  )}
                </div>
              )}

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
        )}

      </div>
    </div>
  )
}
