import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { calculateEarlyFlag } from '../../logic/earlyFlag'
import { selectRule, resolveApproverData, resolveChain } from '../../engine/policyEngine'
import './SubmissionForm.css'

/**
 * Case submission form. Reads requestor identity from AuthContext;
 * module context comes from the parent via props.
 * All policy resolution happens synchronously on submit — no state writes
 * or navigation occur here.
 *
 * @param {object}   props
 * @param {object}   props.module    - Full module record from modules.json
 *                                    (module_id, module_name, module_type, deployment_date)
 * @param {function} props.onSubmit  - Called with the resolved payload; parent owns navigation
 */
export default function SubmissionForm({ module, onSubmit }) {
  const { user } = useAuth()
  const [caseType, setCaseType] = useState('')
  const [reason, setReason]     = useState('')

  const reasonLength = reason.length
  const canSubmit    = caseType !== '' && reasonLength >= 75
  const showHelper   = caseType !== '' && reasonLength > 0 && reasonLength < 75

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    const submissionTimestamp = new Date()
    const earlyFlag    = calculateEarlyFlag(module, submissionTimestamp)
    const ruleNumber   = selectRule(user.staff_type, module.module_type, caseType, earlyFlag)
    const approverData = resolveApproverData(user.employee_id, module.module_id)
    const chain        = resolveChain(ruleNumber, approverData)

    onSubmit({
      moduleId:            module.module_id,
      moduleName:          module.module_name,
      moduleType:          module.module_type,
      requestorId:         user.employee_id,
      requestorName:       user.name,
      caseType,
      reason,
      submissionTimestamp: submissionTimestamp.toISOString(),
      earlyFlag,
      ruleNumber,
      approverChain:       chain,
    })
  }

  return (
    <form className="sf-root" onSubmit={handleSubmit} noValidate>

      <h1 className="sf-page-title">Cancellation Case</h1>

      <div className="sf-header">
        <div className="sf-header-row">
          <span className="sf-header-label">Module ID</span>
          <span className="sf-header-value sf-header-value--mono">{module.module_id}</span>
        </div>
        <div className="sf-header-row">
          <span className="sf-header-label">Module</span>
          <span className="sf-header-value">{module.module_name}</span>
        </div>
        <div className="sf-header-row">
          <span className="sf-header-label">Type</span>
          <span className="sf-header-value sf-header-value--tag">TYPE {module.module_type}</span>
        </div>
        <div className="sf-header-divider" />
        <div className="sf-header-row">
          <span className="sf-header-label">Requestor</span>
          <span className="sf-header-value">{user.name}</span>
        </div>
        <div className="sf-header-row">
          <span className="sf-header-label">eID</span>
          <span className="sf-header-value sf-header-value--mono">{user.employee_id}</span>
        </div>
      </div>

      <div className="sf-field">
        <label className="sf-label" htmlFor="sf-case-type">Cancellation Type</label>
        <select
          id="sf-case-type"
          className="sf-select"
          value={caseType}
          onChange={e => setCaseType(e.target.value)}
        >
          <option value="" disabled>— SELECT —</option>
          <option value="Business">Business</option>
          <option value="Personal">Personal</option>
        </select>
      </div>

      <div className="sf-field">
        <label className="sf-label" htmlFor="sf-reason">Reason for Cancellation</label>
        <textarea
          id="sf-reason"
          className="sf-textarea"
          value={reason}
          onChange={e => setReason(e.target.value)}
          disabled={!caseType}
          placeholder="Minimum 75 characters required."
          rows={6}
        />
        <span className={`sf-char-count${reasonLength >= 75 ? ' sf-char-count--met' : ''}`}>
          {reasonLength} / 75
        </span>
      </div>

      <div className="sf-submit-area">
        {showHelper && (
          <span className="sf-helper">Response length not met to submit.</span>
        )}
        <button
          type="submit"
          className={`sf-submit-btn${canSubmit ? ' sf-submit-btn--active' : ''}`}
          disabled={!canSubmit}
        >
          Submit Request
        </button>
      </div>

    </form>
  )
}
