import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import WorkoutGrid from '../components/WorkoutGrid.jsx'
import ClientInfoCard from '../components/ClientInfoCard.jsx'
import { fetchClientWithCharts, updateChart } from '../services/clientService.js'

export default function ClientPage() {
  const { clientId } = useParams()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recordNumber, setRecordNumber] = useState(1)
  const [saveMessage, setSaveMessage] = useState('')

  // Fetch client and their charts when component mounts or clientId changes
  useEffect(() => {
    async function loadClient() {
      try {
        setLoading(true)
        const data = await fetchClientWithCharts(clientId)
        setClient(data)
        // Set to first chart if available
        if (data.charts && data.charts.length > 0) {
          setRecordNumber(data.charts[0].record_number)
        }
      } catch (err) {
        setError('Failed to load client. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadClient()
  }, [clientId])

  async function handleSave() {
    if (!client || !client.charts || client.charts.length === 0) {
      setError('No chart data to save')
      return
    }

    try {
      // Find the current chart
      const currentChart = client.charts.find(c => c.record_number === recordNumber)
      if (!currentChart) {
        setError('Chart not found')
        return
      }

      // Update the chart with current data
      // Note: You'll need to gather the actual workout data from WorkoutGrid component
      await updateChart(currentChart.id, {
        // Pass updated sessions and exercises here once WorkoutGrid provides them
      })

      setSaveMessage('Workout saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      setError('Failed to save workout. Please try again.')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p>Loading client...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <Link to="/clients" className="btn-secondary">
          Back to Clients
        </Link>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="container">
        <p>Client not found</p>
        <Link to="/clients" className="btn-secondary">
          Back to Clients
        </Link>
      </div>
    )
  }

  return (
    <div className="container">
      <WorkoutGrid
        clientName={client.name}
        recordNumber={recordNumber}
        onRecordChange={setRecordNumber}
        charts={client.charts}
      />

      <ClientInfoCard client={client} />

      <div className="button-group">
        <Link to="/clients" className="btn-secondary">
          Back to Clients
        </Link>
        <button className="btn-primary" onClick={handleSave}>
          Save Workout
        </button>
      </div>

      {saveMessage && (
        <p className="save-status show">{saveMessage}</p>
      )}
      {error && (
        <p className="error-message">{error}</p>
      )}
    </div>
  )
}
