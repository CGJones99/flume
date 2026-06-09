import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import modules from '../../data/modules.json'
import SubmissionForm from '../requestor/SubmissionForm'

export default function CancellationStub() {
  const { user } = useAuth()
  const { moduleId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/demo', { replace: true })
  }, [user, navigate])

  if (!user) return null

  const mod = modules.find(m => m.module_id === moduleId)
  if (!mod) return null

  function handleSubmit(payload) {
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
