import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import Header from '../components/Header.jsx'
import { fetchClients } from '../services/clientService.js'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLetter, setActiveLetter] = useState(null)

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

  const filteredClients = useMemo(() => {
    let result = clients

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      result = result.filter(client =>
        client.name.toLowerCase().includes(query)
      )
    }

    if (activeLetter) {
      result = result.filter(client => {
        const trimmed = client.name.trim()
        if (!trimmed) return false
        const nameParts = trimmed.split(/\s+/)
        const lastName = nameParts[nameParts.length - 1]
        return lastName.toUpperCase().startsWith(activeLetter)
      })
    }

    return result
  }, [clients, searchQuery, activeLetter])

  function handleLetterClick(letter) {
    setActiveLetter(prev => (prev === letter ? null : letter))
  }

  function handleClearFilters() {
    setSearchQuery('')
    setActiveLetter(null)
  }

  const hasActiveFilters = searchQuery.trim() !== '' || activeLetter !== null

  return (
    <>
      <Header title="Coach Dashboard" />

      <div className="container">
        <Link to="/clients/add" id="addClientBtn" className="btn-primary">
          Add Client
        </Link>

        {/* Search & Filter Controls */}
        <div className="client-search-bar">
          <input
            type="search"
            className="client-search-input"
            placeholder="Search clients by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search clients"
          />
          {hasActiveFilters && (
            <button
              type="button"
              className="btn-secondary client-clear-btn"
              onClick={handleClearFilters}
            >
              Clear
            </button>
          )}
        </div>

        <p className="search-hint">Or select the first letter of their last name</p>

        <div className="alpha-filter" role="group" aria-label="Filter by last name initial">
          {ALPHABET.map(letter => (
            <button
              key={letter}
              type="button"
              className={`alpha-btn${activeLetter === letter ? ' active' : ''}`}
              onClick={() => handleLetterClick(letter)}
              aria-pressed={activeLetter === letter}
            >
              {letter}
            </button>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Loading clients...</p>
        ) : filteredClients.length === 0 ? (
          <p className="no-results">No clients match your search.</p>
        ) : (
          <ul id="clientList">
            {filteredClients.map(client => (
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
