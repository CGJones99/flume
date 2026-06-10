import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCaseStore } from '../context/CaseStoreContext'

const APPROVER_ROLES = [
  'PM', 'Principal', 'Partner', 'Practice Head',
  'Line Manager', 'Dept Leader', 'Regional COO', 'Talent Manager',
]

export default function RoleDashboard() {
  const { user }   = useAuth()
  const { cases }  = useCaseStore()
  const navigate   = useNavigate()

  useEffect(() => {
    if (!user) navigate('/demo', { replace: true })
  }, [user, navigate])

  if (!user) return null

  const isApprover = APPROVER_ROLES.includes(user.role) || user.role === 'dAdmin'

  const pendingForUser = isApprover
    ? cases.filter(c =>
        c.current_status === 'pending' &&
        c.approver_chain?.[c.current_approver_index]?.eID === user.employee_id
      ).length
    : 0

  const tiles = [
    {
      id:     'requestor',
      action: 'REQUEST A CANCELLATION',
      active: true,
      path:   '/demo/requestor/dashboard',
    },
    {
      id:     'approver',
      action: 'REVIEW PENDING DECISIONS',
      active: isApprover,
      path:   '/demo/approver/dashboard',
    },
    {
      id:     'dadmin',
      action: 'MANAGE MODULES',
      active: user.role === 'dAdmin',
      path:   '/demo/admin',
    },
  ]

  return (
    <div className="dashboard-root">
      <div className="dashboard-header">
        <span className="dashboard-wordmark">FLUME</span>
        <span className="dashboard-identity">
          {user.employee_id} — {user.name}
        </span>
      </div>
      <div className="dashboard-tiles">
        {tiles.map(tile => {
          const isPulse = (tile.id === 'approver' || tile.id === 'dadmin') && tile.active && pendingForUser > 0

          return (
            <div
              key={tile.id}
              className={[
                'tile-outer',
                tile.active ? 'tile-outer--active' : '',
                isPulse    ? 'tile-outer--pulse'  : '',
              ].filter(Boolean).join(' ')}
              onClick={() => tile.active && navigate(tile.path)}
            >
              <div className={`tile-wrap ${tile.active ? 'tile-wrap--active' : 'tile-wrap--inactive'}`}>
                <div className="tile">
                  <span className="tile-action">{tile.action}</span>
                  {isPulse && (
                    <span className="tile-counter">
                      {pendingForUser === 1
                        ? '1 CASE AWAITING REVIEW'
                        : `${pendingForUser} CASES AWAITING REVIEW`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
