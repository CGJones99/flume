import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './SubmissionConfirmation.css'

/**
 * Read-only summary rendered after a successful submission.
 * Expects the resolved payload in React Router location state
 * (set by CancellationStub on submit). Redirects to /demo/requestor
 * if arrived without state (direct navigation or page refresh).
 */
export default function SubmissionConfirmation() {
  const { user }    = useAuth()
  const location    = useLocation()
  const navigate    = useNavigate()
  const payload     = location.state

  useEffect(() => {
    if (!user)    navigate('/demo', { replace: true })
    if (!payload) navigate('/demo/requestor', { replace: true })
  }, [user, payload, navigate])

  if (!user || !payload) return null

  const {
    moduleId, moduleName, moduleType,
    requestorId, requestorName,
    caseType, reason,
    submissionTimestamp,
    earlyFlag, ruleNumber,
    approverChain,
  } = payload

  const submittedAt = new Date(submissionTimestamp).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const firstApprover = approverChain[0]

  return (
    <div className="sc-root">
      <div className="stub-header">
        <span className="stub-wordmark">FLUME</span>
        <button className="stub-back" onClick={() => navigate('/demo/requestor')}>
          ← MODULES
        </button>
      </div>

      <div className="sc-content">

        <div className="sc-status-bar">
          <span className="sc-status-label">Status</span>
          <span className="sc-status-value">PENDING</span>
          <span className="sc-status-awaiting">
            Awaiting {firstApprover.fullName} — {firstApprover.roleLabel}
          </span>
        </div>

        <section className="sc-section">
          <h2 className="sc-section-heading">Case Details</h2>
          <div className="sc-table">
            <div className="sc-row">
              <span className="sc-row-label">Submitted</span>
              <span className="sc-row-value">{submittedAt}</span>
            </div>
            <div className="sc-row">
              <span className="sc-row-label">Module ID</span>
              <span className="sc-row-value sc-row-value--id">{moduleId}</span>
            </div>
            <div className="sc-row">
              <span className="sc-row-label">Module</span>
              <span className="sc-row-value">{moduleName}</span>
            </div>
            <div className="sc-row">
              <span className="sc-row-label">Type</span>
              <span className="sc-row-value sc-row-value--tag">TYPE {moduleType}</span>
            </div>
            <div className="sc-divider" />
            <div className="sc-row">
              <span className="sc-row-label">Requestor</span>
              <span className="sc-row-value">{requestorName}</span>
            </div>
            <div className="sc-row">
              <span className="sc-row-label">eID</span>
              <span className="sc-row-value sc-row-value--id">{requestorId}</span>
            </div>
            <div className="sc-row">
              <span className="sc-row-label">Case Type</span>
              <span className="sc-row-value">{caseType}</span>
            </div>
            {moduleType === 'B' && (
              <div className="sc-row">
                <span className="sc-row-label">Early Flag</span>
                <span className={`sc-row-value sc-row-value--flag${earlyFlag ? ' sc-row-value--flag-active' : ''}`}>
                  {earlyFlag ? 'YES — RULE 5 APPLIED' : 'NO'}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="sc-section">
          <h2 className="sc-section-heading">Reason for Cancellation</h2>
          <p className="sc-reason">{reason}</p>
        </section>

        <section className="sc-section">
          <h2 className="sc-section-heading">Approver Chain</h2>
          <ol className="sc-chain">
            {approverChain.map((approver, i) => (
              <li key={i} className={`sc-chain-step${approver.isStandIn ? ' sc-chain-step--standin' : ''}`}>
                <span className="sc-chain-index">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="sc-chain-name">{approver.fullName}</span>
                <span className="sc-chain-role">{approver.roleLabel}</span>
                {approver.isStandIn && (
                  <span className="sc-chain-standin">STAND-IN</span>
                )}
              </li>
            ))}
          </ol>
        </section>

      </div>
    </div>
  )
}
