import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCaseStore } from '../../context/CaseStoreContext'
import modules from '../../data/modules.json'
import SubmissionForm from '../requestor/SubmissionForm'

export default function CancellationStub() {
  const { user } = useAuth()
  const { submitCase, appendEvent } = useCaseStore()
  const { moduleId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/demo', { replace: true })
  }, [user, navigate])


  if (!user) return null

  const mod = modules.find(m => m.module_id === moduleId)
  if (!mod) return null

  function handleSubmit(payload) {
    const case_id = submitCase({
      requestor_id:     payload.requestorId,
      module_id:        payload.moduleId,
      case_type:        payload.caseType,
      rule_number:      payload.ruleNumber,
      early_flag:       payload.earlyFlag,
      requestor_reason: payload.reason,
      approver_chain:   payload.approverChain,
    })

    const firstApprover = payload.approverChain[0]
    appendEvent({
      case_id,
      actor_id:        'SYSTEM',
      event_type:      'notification_sent',
      sequence_number: 1,
      timestamp:       new Date().toISOString(),
      reason:          `Notification sent to ${firstApprover.fullName} (${firstApprover.roleLabel}). Production: Microsoft Teams.`,
    })

    navigate('/demo/requestor/confirm', { state: payload })
  }

  return (
    <div className="stub-root">
      <div className="stub-header">
        <span className="stub-wordmark">FLUME</span>
        <button className="stub-back" onClick={() => navigate('/demo/requestor')}>
          ← MODULES
        </button>
      </div>
      <div className="requestor-content">
        <SubmissionForm module={mod} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
