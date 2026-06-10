import employees from '../data/employees.json'

const empMap = new Map(employees.map(e => [e.employee_id, e]))

const EVENT_LABELS = {
  submission:        'Submitted',
  notification_sent: 'Notification Sent',
  approved:          'Approved',
  denied:            'Denied',
}

function formatTs(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function resolveActor(actorId, requestorId) {
  if (actorId === 'SYSTEM') return { name: 'SYSTEM', roleLabel: null, eID: null }
  const emp = empMap.get(actorId)
  if (actorId === requestorId) {
    return { name: emp?.name ?? '—', roleLabel: 'Requestor', eID: actorId }
  }
  return { name: emp?.name ?? '—', roleLabel: emp?.role ?? '—', eID: actorId }
}

/**
 * Renders the audit log entries for a case.
 *
 * @param {object}  props
 * @param {object}  props.caseRecord
 * @param {Array}   props.caseEvents  - sorted by sequence_number ascending
 * @param {boolean} [props.showEid]   - render actor eIDs; dAdmin view only
 */
export default function CaseHistory({ caseRecord, caseEvents, showEid = false }) {
  return (
    <div className="acv-history">
      {caseEvents.length === 0 ? (
        <p className="acv-history-empty">NO EVENTS RECORDED.</p>
      ) : (
        <div className="acv-history-entries">
          {caseEvents.map(evt => {
            const actor   = resolveActor(evt.actor_id, caseRecord.requestor_id)
            const isNotif = evt.event_type === 'notification_sent'
            return (
              <div key={evt.event_id} className="acv-history-entry">
                <div className="acv-history-meta">
                  <span className="acv-history-actor">{actor.name}</span>
                  {showEid && actor.eID && (
                    <span className="acv-history-eid">{actor.eID}</span>
                  )}
                  {actor.roleLabel && (
                    <span className="acv-history-role">{actor.roleLabel}</span>
                  )}
                  <span className="acv-history-type">
                    {EVENT_LABELS[evt.event_type] ?? evt.event_type}
                  </span>
                  <span className="acv-history-ts">{formatTs(evt.timestamp)}</span>
                </div>
                {evt.reason && (
                  <p className="acv-history-reason">{evt.reason}</p>
                )}
                {isNotif && (
                  <div className="acv-teams-callout">PRODUCTION: MICROSOFT TEAMS</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
