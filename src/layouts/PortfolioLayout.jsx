import { NavLink, Outlet } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/',           label: 'PROBLEM',   end: true },
  { to: '/approach',   label: 'APPROACH'             },
  { to: '/decisions',  label: 'DECISIONS'            },
  { to: '/build',      label: 'BUILD'                },
  { to: '/demo',       label: 'DEMO'                 },
]

export default function PortfolioLayout() {
  return (
    <div className="portfolio-root">
      <nav className="portfolio-nav">
        <span className="portfolio-wordmark">FLUME</span>
        <div className="portfolio-links">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `portfolio-link${isActive ? ' portfolio-link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="portfolio-content">
        <Outlet />
      </main>
    </div>
  )
}
