import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { createClient, createChart } from '../services/clientService.js'

export default function AddClientPage() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [goals, setGoals] = useState('')
  const [injuries, setInjuries] = useState('')
  const [protocol, setProtocol] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`

      // Derive PIN from last 4 digits of phone number
      const digitsOnly = phone.replace(/\D/g, '')
      const pin = digitsOnly.slice(-4)

      // Create the client in the DB
      const newClient = await createClient({
        name: fullName,
        pin,
        phone_number: phone.trim(),
        goals: goals.trim(),
        injuries: injuries.trim(),
        protocol: protocol.trim(),
      })

      // Create their first empty chart
      await createChart(newClient.id, 1, {
        sessions: JSON.stringify({ date: '', trainer: '', routine: '' }),
        exercises: JSON.stringify({ nameA: '', nameB: '', results: [] }),
      })

      // Navigate to the clients list
      navigate('/clients')
    } catch (err) {
      setError('Failed to create client. Please try again.')
      console.error(err)
      setLoading(false)
    }
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
            <label htmlFor="phone">Phone Number <span style={{ fontWeight: 'normal', fontSize: '0.875rem', color: '#666' }}>— Last four digits will be client's PIN</span></label>
            <input
              type="tel"
              id="phone"
              placeholder="Ex. 480-222-6345"
              value={phone}
              onChange={e => setPhone(e.target.value)}
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

          {error && <p className="error-message">{error}</p>}

          <div className="button-group">
            <Link to="/clients" className="btn-secondary">
              Back to Clients
            </Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
