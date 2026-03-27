import { useState, useEffect } from 'react'

export default function ClientInfoCard({ client }) {
  const [goals, setGoals] = useState('')
  const [injuries, setInjuries] = useState('')
  const [protocol, setProtocol] = useState('')

  // Populate fields when client data loads
  useEffect(() => {
    if (client) {
      setGoals(client.goals || '')
      setInjuries(client.injuries || '')
      setProtocol(client.protocol || '')
    }
  }, [client])

  return (
    <div className="client-info-card">
      <div className="info-section">
        <h3>Goals</h3>
        <textarea
          placeholder="Enter client goals..."
          className="info-textarea"
          value={goals}
          onChange={e => setGoals(e.target.value)}
        />
      </div>

      <div className="info-section">
        <h3>Injuries</h3>
        <textarea
          placeholder="Enter any injuries or limitations..."
          className="info-textarea"
          value={injuries}
          onChange={e => setInjuries(e.target.value)}
        />
      </div>

      <div className="info-section">
        <h3>Protocol</h3>
        <textarea
          placeholder="Enter protocol notes..."
          className="info-textarea"
          value={protocol}
          onChange={e => setProtocol(e.target.value)}
        />
      </div>
    </div>
  )
}
