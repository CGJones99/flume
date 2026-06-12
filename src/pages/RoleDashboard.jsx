import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCaseStore } from '../context/CaseStoreContext'
import { useRequestorRead } from '../context/RequestorReadContext'
import DemoHeader from '../components/DemoHeader'

const APPROVER_ROLES = [
  'Team Lead', 'Senior Director',
  'Line Manager', 'Senior Manager', 'Department Head',
  'HR Rep',
]

export default function RoleDashboard() {
  const { user }          = useAuth()
  const { cases }         = useCaseStore()
  const { readCaseIds }   = useRequestorRead()
  const navigate          = useNavigate()

  useEffect(() => {
    if (!user) navigate('/demo', { replace: true })
  }, [user, navigate])

  if (!user) return null

  const isApprover = APPROVER_ROLES.includes(user.role) || user.role === 'dAdmin'

  // Cases where this user is the current approver, split by whether it's a dAdmin final-signoff
  // slot (roleLabel === 'Dept Admin') or an intermediate approver step.
  // A dAdmin can appear in both buckets — e.g. standing in mid-chain vs. their own final slot.
  const myPending = cases.filter(c =>
    c.current_status === 'pending' &&
    c.approver_chain?.[c.current_approver_index]?.eID === user.employee_id
  )

  const pendingAsApprover = myPending.filter(c =>
    c.approver_chain[c.current_approver_index]?.roleLabel !== 'Dept Admin'
  ).length

  const pendingAsDAdmin = myPending.filter(c =>
    c.approver_chain[c.current_approver_index]?.roleLabel === 'Dept Admin'
  ).length

  // S-R8: unread closed cases drive the requestor tile pulse
  const unreadClosedCount = cases.filter(c =>
    c.requestor_id === user.employee_id &&
    (c.current_status === 'fully_approved' || c.current_status === 'denied') &&
    !readCaseIds.has(c.case_id)
  ).length

  const tiles = [
    {
      id:         'requestor',
      action:     'Submit and Track Cancellation Requests',
      active:     true,
      path:       '/demo/requestor/dashboard',
      count:      unreadClosedCount,
      countLabel: unreadClosedCount === 1
        ? '1 DECISION TO REVIEW'
        : `${unreadClosedCount} DECISIONS TO REVIEW`,
    },
    {
      id:     'approver',
      action: 'REVIEW PENDING DECISIONS',
      active: isApprover,
      path:   '/demo/approver/dashboard',
      count:  isApprover ? pendingAsApprover : 0,
    },
    {
      id:     'dadmin',
      action: 'MANAGE MODULES',
      active: user.role === 'dAdmin',
      path:   '/demo/admin',
      count:  user.role === 'dAdmin' ? pendingAsDAdmin : 0,
    },
  ]

  return (
    <div className="dashboard-root">
      <DemoHeader context="ROLE SELECT" />
      <div className="dashboard-tiles">
        {tiles.filter(t => t.active).map(tile => {
          const isPulse = tile.active && tile.count > 0

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
                      {tile.countLabel ?? (tile.count === 1
                        ? '1 CASE AWAITING REVIEW'
                        : `${tile.count} CASES AWAITING REVIEW`)}
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
