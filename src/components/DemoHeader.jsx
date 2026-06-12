import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Shared chrome for every demo screen: wordmark, screen context label,
 * signed-in identity readout, and an optional back action. Replaces the
 * per-page stub-header copies so the header reads identically everywhere.
 *
 * @param {object} props
 * @param {string} [props.context]   - Screen label rendered after the wordmark (e.g. "APPROVER // CASE REVIEW")
 * @param {string} [props.backLabel] - Back button text; omit along with backTo to hide the button
 * @param {string} [props.backTo]    - Route the back button navigates to
 */
export default function DemoHeader({ context, backLabel, backTo }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="demo-header">
      <div className="dh-left">
        <span className="dh-wordmark">FLUME</span>
        {context && <span className="dh-context">{context}</span>}
      </div>
      <div className="dh-right">
        {user && (
          <span className="dh-identity">
            <span className="dh-identity-eid">{user.employee_id}</span>
            {user.name}
          </span>
        )}
        {backTo && (
          <button className="stub-back" onClick={() => navigate(backTo)}>
            ← {backLabel}
          </button>
        )}
      </div>
    </header>
  )
}
