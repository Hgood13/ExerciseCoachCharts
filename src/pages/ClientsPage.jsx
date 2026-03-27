import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import { fetchClients } from '../services/clientService.js'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadClients() {
      try {
        setLoading(true)
        const data = await fetchClients()
        setClients(data)
      } catch (err) {
        setError('Failed to load clients. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  return (
    <>
      <Header title="Coach Dashboard" />

      <div className="container">
        <Link to="/clients/add" id="addClientBtn" className="btn-primary">
          Add Client
        </Link>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Loading clients...</p>
        ) : (
          <ul id="clientList">
            {clients.map(client => (
              <li key={client.id}>
                <Link to={`/clients/${client.id}`}>{client.name}</Link>
              </li>
            ))}
          </ul>
        )}

        {/* Motivational Image Section */}
        <div className="motivational-section">
          <img
            src="/images/Strength_Changes_Everything.jpg"
            alt="Strength Changes Everything"
            className="motivational-image"
          />
        </div>
      </div>
    </>
  )
}
