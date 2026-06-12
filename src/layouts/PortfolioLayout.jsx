import { NavLink, Outlet } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/',           label: 'PROBLEM',           end: true },
  { to: '/build',      label: 'BUILD'                        },
  { to: '/tradeoffs',  label: 'TRADEOFFS & RETRO'            },
  { to: '/demo',       label: 'DEMO'                         },
]

const FOOTER_COPY = 'FLUME is a portfolio proof of concept. It is not a commercial product, not for sale, and not for redistribution. The system design and policy rules are generalized abstractions inspired by real operational challenges in resource allocation and compliance. Any resemblance to specific organizations, individuals, or internal processes is coincidental. No confidential information has been disclosed.'

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
      <footer className="portfolio-footer">
        <p className="portfolio-footer-text">{FOOTER_COPY}</p>
      </footer>
    </div>
  )
}
