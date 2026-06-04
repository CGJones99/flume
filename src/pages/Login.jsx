import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import employees from '../data/employees.json'

export default function Login() {
  const [eid, setEid] = useState('')
  const [error, setError] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    const employee = employees.find(
      emp => emp.employee_id === eid.trim().toUpperCase()
    )
    if (!employee) {
      setError(true)
      return
    }
    login(employee)
    navigate('/demo/dashboard')
  }

  return (
    <div className="login-root">
      <div className="login-container">
        <h1 className="login-wordmark">FLUME</h1>
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-label" htmlFor="eid-input">
            EMPLOYEE ID
          </label>
          <input
            id="eid-input"
            className={`login-input${error ? ' login-input--error' : ''}`}
            type="text"
            value={eid}
            onChange={e => {
              setEid(e.target.value)
              if (error) setError(false)
            }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <span className="login-error">
            {error ? 'IDENTITY NOT FOUND' : ''}
          </span>
          <button className="login-button" type="submit">
            AUTHENTICATE
          </button>
        </form>
      </div>
    </div>
  )
}
