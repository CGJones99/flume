import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const APPROVER_ROLES = [
  'PM', 'Principal', 'Partner', 'Practice Head',
  'Line Manager', 'Dept Leader', 'Regional COO', 'Talent Manager',
]

export default function RoleDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/', { replace: true })
  }, [user, navigate])

  if (!user) return null

  const tiles = [
    {
      id: 'requestor',
      label: 'REQUESTOR',
      active: true,
      path: '/requestor',
    },
    {
      id: 'approver',
      label: 'APPROVER',
      active: APPROVER_ROLES.includes(user.role) || user.role === 'dAdmin',
      path: '/approver',
    },
    {
      id: 'dadmin',
      label: 'DEPT ADMIN',
      active: user.role === 'dAdmin',
      path: '/admin',
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
        {tiles.map(tile => (
          <div
            key={tile.id}
            className={`tile ${tile.active ? 'tile--active' : 'tile--inactive'}`}
            onClick={() => tile.active && navigate(tile.path)}
          >
            <span className="tile-label">{tile.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
