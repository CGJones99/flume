import prdContent from '../../../flume_prd_v1.1.md?raw'

// ── Minimal markdown renderer ────────────────────────────────────────────────
// Handles the subset of markdown used in flume_prd_v1.1.md:
// headings (h1-h3), paragraphs, blockquotes, ul, ol, tables, hr, inline bold/code/del

function renderInline(text) {
  const out = []
  let remaining = text
  let key = 0
  const re = /(\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`)/
  while (remaining.length > 0) {
    const match = re.exec(remaining)
    if (!match) { out.push(remaining); break }
    if (match.index > 0) out.push(remaining.slice(0, match.index))
    const token = match[1]
    if (token.startsWith('**'))
      out.push(<strong key={key++}>{token.slice(2, -2)}</strong>)
    else if (token.startsWith('~~'))
      out.push(<del key={key++}>{token.slice(2, -2)}</del>)
    else
      out.push(<code key={key++} className="prd-inline-code">{token.slice(1, -1)}</code>)
    remaining = remaining.slice(match.index + token.length)
  }
  return out
}

function isSepRow(line) {
  return line.split('|').slice(1, -1).every(c => /^[-:\s]+$/.test(c))
}

function renderTable(lines, idx) {
  const rows = lines.filter(l => !isSepRow(l))
  if (!rows.length) return null
  const parseRow = r => r.split('|').slice(1, -1).map(c => c.trim())
  const [head, ...body] = rows
  return (
    <div key={idx} className="prd-table-wrap">
      <table className="prd-table">
        <thead>
          <tr>{parseRow(head).map((c, i) => <th key={i} className="prd-th">{renderInline(c)}</th>)}</tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} className="prd-tr">
              {parseRow(row).map((c, j) => <td key={j} className="prd-td">{renderInline(c)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function groupBlocks(lines) {
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i].trimEnd()
    if (!line) { i++; continue }

    if (line === '---') {
      blocks.push({ type: 'hr' }); i++
    } else if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4) }); i++
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3) }); i++
    } else if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2) }); i++
    } else if (line.startsWith('> ') || line === '>') {
      const bq = []
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i].trimEnd() === '>')) {
        bq.push(lines[i].startsWith('> ') ? lines[i].slice(2) : '')
        i++
      }
      blocks.push({ type: 'blockquote', lines: bq })
    } else if (line.startsWith('|')) {
      const tbl = []
      while (i < lines.length && lines[i].trimEnd().startsWith('|')) {
        tbl.push(lines[i].trimEnd()); i++
      }
      blocks.push({ type: 'table', lines: tbl })
    } else if (/^[-*] /.test(line)) {
      const items = []
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].slice(2)); i++
      }
      blocks.push({ type: 'ul', items })
    } else if (/^\d+\. /.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, '')); i++
      }
      blocks.push({ type: 'ol', items })
    } else {
      const p = []
      while (i < lines.length) {
        const l = lines[i].trimEnd()
        if (!l || l.startsWith('#') || l.startsWith('>') || l.startsWith('|') ||
            /^[-*] /.test(l) || l === '---' || /^\d+\. /.test(l)) break
        p.push(l); i++
      }
      if (p.length) blocks.push({ type: 'p', text: p.join(' ') })
    }
  }
  return blocks
}

function renderBlock(block, idx) {
  switch (block.type) {
    case 'h1': return <h2 key={idx} className="prd-h1">{renderInline(block.text)}</h2>
    case 'h2': return <h3 key={idx} className="prd-h2">{renderInline(block.text)}</h3>
    case 'h3': return <h4 key={idx} className="prd-h3">{renderInline(block.text)}</h4>
    case 'hr': return <hr key={idx} className="prd-hr" />
    case 'p':  return <p  key={idx} className="prd-p">{renderInline(block.text)}</p>
    case 'ul': return (
      <ul key={idx} className="prd-ul">
        {block.items.map((item, i) => <li key={i} className="prd-li">{renderInline(item)}</li>)}
      </ul>
    )
    case 'ol': return (
      <ol key={idx} className="prd-ol">
        {block.items.map((item, i) => <li key={i} className="prd-li">{renderInline(item)}</li>)}
      </ol>
    )
    case 'blockquote': return (
      <blockquote key={idx} className="prd-bq">
        {block.lines.map((line, i) =>
          line ? <p key={i} className="prd-bq-p">{renderInline(line)}</p> : null
        )}
      </blockquote>
    )
    case 'table': return renderTable(block.lines, idx)
    default: return null
  }
}

function MarkdownDoc({ source }) {
  const blocks = groupBlocks(source.split('\n'))
  return <div className="prd-doc">{blocks.map((b, i) => renderBlock(b, i))}</div>
}

// ── Static content ───────────────────────────────────────────────────────────

const FWD_ITEMS = [
  'Sysadmin configuration UI — module assignment, dAdmin mapping, and policy matrix edits with dept leadership confirmation before publishing.',
  'Leadership visibility layer — cross-department exception trend reporting; distinct from the dAdmin module view, which is operational rather than analytical.',
  'Notification integrations — Microsoft Teams (primary target), Slack, and email; the audit log event model is already structured for a delivery layer without changes to routing logic.',
  'Policy matrix configuration screen — add, remove, or reweight routing rules as data changes, no code deployment required.',
  'Employee directory integration — live sync from HR system via eID, replacing the static seed file; handles approver changes and in-flight case locking mid-chain.',
  'Chargeback enforcement tooling — the compliance layer that makes the audit log actionable, not just informational.',
]

const STACK_ROWS = [
  ['Hosting', 'Replit', 'Velocity over credibility optics. Public URL, zero setup for non-technical recruiters.'],
  ['Frontend', 'React via Vite', 'Industry standard, hiring-panel recognition, clean for a browser-only app. Next.js rejected — SSR adds nothing for a client-only demo.'],
  ['Logic layer', 'Browser-side only', 'Policy engine runs in JS on the client. No server to stand up, deploy, or explain.'],
  ['Dev tooling', 'Claude Code in VS Code', 'All code written locally, pushed to GitHub. Replit is hosting and execution, not authoring.'],
  ['Seed data', 'JSON files', 'Relational structure between users, modules, roles, and deployment dates. Designed to swap for a real database in production.'],
  ['Portfolio structure', 'Single URL', 'One codebase, one deployment. Seamless recruiter experience without context switches or separate links.'],
]

// Set to a public read-only Notion share URL before publishing
const NOTION_BOARD_URL = null

// ── Component ────────────────────────────────────────────────────────────────

export default function Build() {
  return (
    <div className="ps-page">

      <section className="ps-hero">
        <span className="ps-eyebrow">REFERENCE DEPTH</span>
        <h1 className="ps-title">BUILD</h1>
        <p className="ps-tagline">
          For someone who wants to verify rigor rather than be persuaded by narrative.
          The PRD, the stack decisions, and where this goes next.
        </p>
      </section>

      <section className="ps-section">
        <span className="ps-section-label">PRODUCT REQUIREMENTS DOCUMENT</span>
        <details className="prd-expand">
          <summary className="prd-summary">
            <span className="prd-summary-label">v1.1 — AS-BUILT</span>
            <span className="prd-summary-hint" />
          </summary>
          <div className="prd-content">
            <MarkdownDoc source={prdContent} />
            <button
              className="prd-collapse-sticky"
              onClick={e => {
                const details = e.target.closest('details')
                details.open = false
                details.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              COLLAPSE ↑
            </button>
          </div>
        </details>
      </section>

      <section className="ps-section">
        <span className="ps-section-label">WHERE THIS GOES</span>
        <div className="ps-prose">
          <p>Out of scope for the demo. Where Flume goes if it weren't a portfolio piece.</p>
        </div>
        <ul className="build-fwd-list">
          {FWD_ITEMS.map((item, i) => <li key={i} className="build-fwd-item">{item}</li>)}
        </ul>
      </section>

      <section className="ps-section">
        <span className="ps-section-label">STACK DECISIONS</span>
        <div className="prd-table-wrap">
          <table className="prd-table">
            <thead>
              <tr>
                <th className="prd-th">Decision</th>
                <th className="prd-th">Choice</th>
                <th className="prd-th">Rationale</th>
              </tr>
            </thead>
            <tbody>
              {STACK_ROWS.map(([decision, choice, rationale], i) => (
                <tr key={i} className="prd-tr">
                  <td className="prd-td prd-td--key">{decision}</td>
                  <td className="prd-td prd-td--val">{choice}</td>
                  <td className="prd-td">{rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ps-section">
        <span className="ps-section-label">BUILD TRACKER</span>
        <div className="ps-prose">
          <p>
            The Notion board behind this build — tickets, decisions, and evolution log.
          </p>
        </div>
        {NOTION_BOARD_URL ? (
          <a href={NOTION_BOARD_URL} className="notion-link" target="_blank" rel="noopener noreferrer">
            VIEW READ-ONLY BOARD →
          </a>
        ) : (
          <span className="notion-link notion-link--pending">BOARD LINK PENDING</span>
        )}
      </section>

    </div>
  )
}
