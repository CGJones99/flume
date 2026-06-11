import { createContext, useContext, useState, useCallback } from 'react'

const RequestorReadContext = createContext(null)

export function RequestorReadProvider({ children }) {
  const [readCaseIds, setReadCaseIds] = useState(new Set())

  const markRead = useCallback((id) => {
    setReadCaseIds(prev => new Set([...prev, id]))
  }, [])

  const markAllRead = useCallback((ids) => {
    setReadCaseIds(prev => new Set([...prev, ...ids]))
  }, [])

  return (
    <RequestorReadContext.Provider value={{ readCaseIds, markRead, markAllRead }}>
      {children}
    </RequestorReadContext.Provider>
  )
}

export function useRequestorRead() {
  return useContext(RequestorReadContext)
}
