export default function Problem() {
  return (
    <div className="ps-page">
      <section className="ps-hero">
        <span className="ps-eyebrow">EXCEPTION REQUEST MANAGEMENT</span>
        <h1 className="ps-title">FLUME</h1>
        <p className="ps-tagline">
          Structured case management for exception requests in cost-center departments.
          Auto-routed. Auditable. Every delay has a named responsible party.
        </p>
      </section>

      <section className="ps-section">
        <span className="ps-section-label">THE PROBLEM</span>
        <div className="ps-prose">
          <p>
            A cost-center department's budget is not being spent effectively due to a
            high-friction manual process to request exceptions to resource commitments —
            a process so painful that staff are discouraged from even trying to comply
            with policy.
          </p>
          <p>
            That process is entirely run through email, relies on individual interpretation
            of policy, and has no auditability. As a result, leadership has no view into
            the process. They can neither support the managing department nor address
            problematic teams.
          </p>
        </div>
      </section>

      <section className="ps-section">
        <span className="ps-section-label">WHAT FLUME IS</span>
        <div className="ps-prose">
          <p>
            Flume replaces the email process with auditable, auto-routed approval chains —
            so leadership stops chasing and starts enforcing.
          </p>
          <p>
            Submit a case. The system calculates the correct approver chain from policy.
            Routes it automatically. Every delay has a named responsible party and a
            timestamp. Every decision is logged.
          </p>
        </div>
      </section>
    </div>
  )
}
