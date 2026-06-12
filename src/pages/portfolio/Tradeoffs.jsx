const DECISIONS = [
  {
    num: '01',
    title: 'POLICY ENGINE CARD SPLIT',
    sub: 'PE-02a + PE-02b',
    body: [
      'The original PE-02 card was scoped as a single M covering the full policy engine. Mid-build, it became clear the card contained two independent concerns: rule selection (pure logic, no data access) and chain resolution (requires employee and module data). Splitting into PE-02a and PE-02b allowed each function to be tested in isolation before wiring them together, reducing the risk of chasing compound bugs. The split added one card but removed a class of debugging complexity.',
    ],
  },
  {
    num: '02',
    title: 'ROLEDASHBOARD VISIBILITY',
    sub: 'Polish vs. MVP timing',
    body: [
      'During a mid-build demo walkthrough, it became apparent that showing unavailable role tiles to users unfamiliar with the persona structure could create confusion — users might try to click into a flow they don\'t have access to. The fix was straightforward, but context-switching off the requestor and approver flows mid-week would have fragmented momentum. Decision: defer to polish phase. The behavior doesn\'t block any testable flow, and the cost of fixing it in a focused polish pass is lower than fixing it reactively during active feature work.',
    ],
  },
  {
    num: '03',
    title: 'ESCALATION RULE SIMPLIFICATION',
    sub: 'Multiple staff types + seniority',
    body: [
      'A real-world policy matrix would include multiple staff types and seniority-based routing variations. Both were scoped out of the demo in favor of a clean binary model: Field or Office, Module A or B, Business or Personal. The simplification keeps the policy engine testable against a complete but bounded rule set. Both omissions are documented in Production Notes for future implementation.',
    ],
  },
  {
    num: '04',
    title: 'MOCK NOTIFICATION INBOX — KILLED',
    sub: '2026-06-09',
    body: [
      'The original scope included an in-app mock email inbox to demonstrate notification-driven behavior without requiring a real integration. During build review, the inbox was cut for two reasons. First, it was theater: a fake email client inside a case management tool that a user would immediately read as simulated, not functional. Second, it introduced meaningful confusion risk during a seeded demo walkthrough — a user switching personas would encounter an inbox that looked like a distinct product surface, not a feature of the routing flow.',
      'The replacement is an audit log system event written at every routing step (SYSTEM → Notification sent to [Name] ([Role])), surfaced inline on the relevant case views. This keeps the notification story honest — it records that the action happened and who was targeted — without pretending to be an email client. Production channel remains Microsoft Teams, noted as a one-liner on each system event entry. Audit log display rules by role were locked at the same time: eIDs never render outside the dAdmin view; requestors see name, role, timestamp, and event type only; approvers receive the same treatment; dAdmins see the full log including eIDs.',
    ],
  },
  {
    num: '05',
    title: 'CASE STORE PERSISTENCE — IN-MEMORY BY DESIGN',
    sub: '2026-06-09',
    body: [
      'Case and event state lives in React context only. No localStorage, sessionStorage, or external database. The decision was made on two grounds. First, isolation: each user running the demo gets a clean state with no risk of stale data from a prior session or conflicts from a concurrent viewer — persistence would require a reset mechanism and guards against cross-session pollution, adding complexity with no demo value. Second, simplicity: the demo is a single-session walkthrough, and in-memory state survives persona switches (which use client-side navigation without a page reload) cleanly.',
      'The known limitation is that a full page refresh resets all case state, which is flagged in the demo README. Production would replace the in-memory store with a real database, with the context layer acting as the interface boundary — the switch requires no changes to any component that consumes the store.',
    ],
  },
  {
    num: '06',
    title: 'TERMINAL STATUS MODEL AND CASE HISTORY',
    sub: '2026-06-10',
    body: [
      'Two terminal status values were locked: fully_approved and denied. The write occurs at dAdmin final signoff or on mid-chain denial by any intermediary approver. Cases reaching either terminal status route automatically to a historical view — a past cases bucket on the requestor dashboard and a closed cases stack within each module on the dAdmin view.',
      'This was a production-motivated decision: a requestor who can\'t see the outcome of a closed case loses the CYA visibility that was a core reason for them engaging with the tool at all. The dAdmin module split (active vs past, keyed on deployment date) similarly reflects real operational logic — past modules can still carry open cases, such as a discretionary late approval, and dAdmins need to see those without them cluttering the active module view.',
    ],
  },
  {
    num: '07',
    title: 'PULSE NOTIFICATION SYSTEM AND READ STATE',
    sub: '2026-06-10',
    body: [
      'With the mock inbox killed, the question of how users learn that something needs their attention fell entirely to in-app signaling. The solution is a pulse animation on role tiles and (for dAdmins) on individual module rows, with a live count of pending actions. The pulse trigger is specific: for dAdmins, it fires only when the designated module dAdmin — not a stand-in — is the final actor and the case has reached that step. Stand-in cases don\'t pulse, preventing a false signal when the dAdmin is acting in an exceptional capacity rather than their normal gatekeeper role.',
      'Read state (pulse clearing on interaction) is derived from a local flag, not from case store state, keeping it consistent with the in-memory persistence model. For requestors, the equivalent signal is a tile pulse on final decision with per-row pulses on the past cases dashboard that clear on expansion.',
    ],
  },
]

export default function Tradeoffs() {
  return (
    <div className="ps-page">
      <section className="ps-hero">
        <span className="ps-eyebrow">SEVEN DECISIONS</span>
        <h1 className="ps-title">TRADEOFFS &amp; RETRO</h1>
        <p className="ps-tagline">
          Seven decisions made during the build. Each one documented while the
          reasoning was still fresh.
        </p>
      </section>

      <section className="ps-section">
        <span className="ps-section-label">RETROSPECTIVE</span>
        <div className="ps-prose">
          <p>
            Some of these decisions trace back to decomposition — scoped work that
            looked atomic turned out to have independent concerns only visible under
            build pressure. Thinking in features, not independently testable units
            of behavior. Wireframing earlier would have surfaced those before the
            build did.
          </p>
          <p>
            The rest were made in motion. The build surfaced a constraint or a wrong
            assumption and the right call was to change course rather than defend the
            plan. Some decisions you plan. The rest the build hands you.
          </p>
        </div>
      </section>

      <section className="ps-section decisions-section">
        <span className="ps-section-label">THE DECISIONS</span>
        <div className="decision-entries">
          {DECISIONS.map(({ num, title, sub, body }) => (
            <div key={num} className="decision-entry">
              <div className="decision-left">
                <span className="decision-num">{num}</span>
                <span className="decision-title">{title}</span>
                {sub && <span className="decision-sub">{sub}</span>}
              </div>
              <div className="decision-prose">
                {body.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
