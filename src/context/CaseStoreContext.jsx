import { createContext, useContext, useState } from 'react'

const CaseStoreContext = createContext(null)

let caseCounter = 0
let eventCounter = 0

function nextCaseId()  { return `CASE-${String(++caseCounter).padStart(4, '0')}` }
function nextEventId() { return `EVT-${String(++eventCounter).padStart(6, '0')}` }

export function CaseStoreProvider({ children }) {
  const [cases, setCases]   = useState([])
  const [events, setEvents] = useState([])

  function submitCase(caseData) {
    const case_id  = nextCaseId()
    const now      = new Date().toISOString()

    const newCase = {
      ...caseData,
      case_id,
      initial_timestamp:      now,
      most_recent_action:     'submission',
      most_recent_timestamp:  now,
      current_status:         'pending',
      current_approver_index: 0,
    }

    const submissionEvent = {
      event_id:        nextEventId(),
      case_id,
      actor_id:        caseData.requestor_id,
      event_type:      'submission',
      sequence_number: 0,
      timestamp:       now,
      reason:          caseData.requestor_reason ?? null,
    }

    setCases(prev  => [...prev, newCase])
    setEvents(prev => [...prev, submissionEvent])

    return case_id
  }

  function appendEvent(eventData) {
    const event = { event_id: nextEventId(), ...eventData }
    setEvents(prev => [...prev, event])
  }

  function updateCase(caseId, updates) {
    setCases(prev => prev.map(c => c.case_id === caseId ? { ...c, ...updates } : c))
  }

  return (
    <CaseStoreContext.Provider value={{ cases, events, submitCase, appendEvent, updateCase }}>
      {children}
    </CaseStoreContext.Provider>
  )
}

export function useCaseStore() {
  return useContext(CaseStoreContext)
}
