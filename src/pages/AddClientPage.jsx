import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'

export default function AddClientPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [goals, setGoals] = useState('')
  const [injuries, setInjuries] = useState('')
  const [protocol, setProtocol] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const fullName = `${firstName.trim()} ${lastName.trim()}`
    // MVP: simulate adding a client; replace with real API call when backend is ready
    setSaveMessage(`Client "${fullName}" has been successfully added!`)
    setFirstName('')
    setLastName('')
    setGoals('')
    setInjuries('')
    setProtocol('')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  return (
    <>
      <Header title="Coach Dashboard" />

      <div className="container">
        <div className="page-header">
          <h2>Add New Client</h2>
          <p className="subtitle">Enter client information to create a new profile</p>
        </div>

        <form id="addClientForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              placeholder="Enter first name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              placeholder="Enter last name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="goals">Goals</label>
            <textarea
              id="goals"
              placeholder="Enter client goals..."
              className="info-textarea"
              value={goals}
              onChange={e => setGoals(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="injuries">Injuries</label>
            <textarea
              id="injuries"
              placeholder="Enter any injuries or limitations..."
              className="info-textarea"
              value={injuries}
              onChange={e => setInjuries(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="protocol">Protocol</label>
            <textarea
              id="protocol"
              placeholder="Enter protocol notes..."
              className="info-textarea"
              value={protocol}
              onChange={e => setProtocol(e.target.value)}
              required
            />
          </div>

          <div className="button-group">
            <Link to="/clients" className="btn-secondary">
              Back to Clients
            </Link>
            <button type="submit" className="btn-primary">
              Create Client
            </button>
          </div>

          {saveMessage && (
            <p className="save-status show">{saveMessage}</p>
          )}
        </form>
      </div>
    </>
  )
}
