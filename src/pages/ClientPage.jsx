import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import WorkoutGrid from '../components/WorkoutGrid.jsx'
import RoutineGrid from '../components/RoutineGrid.jsx'
import WorkoutOptions from '../components/WorkoutOptions.jsx'
import ClientInfoCard from '../components/ClientInfoCard.jsx'
import { fetchClientWithCharts, updateChart, createChart } from '../services/clientService.js'

export default function ClientPage() {
  const { clientId } = useParams()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recordNumber, setRecordNumber] = useState(1)
  const [saveMessage, setSaveMessage] = useState('')
  const [mode, setMode] = useState('view') // 'view' | 'create'
  const workoutGridRef = useRef(null)
  const routineGridRef = useRef(null)

  // Fetch client and their charts when component mounts or clientId changes
  useEffect(() => {
    async function loadClient() {
      try {
        setLoading(true)
        const data = await fetchClientWithCharts(clientId)
        setClient(data)
        // Set to the chart with the highest record number
        if (data.charts && data.charts.length > 0) {
          const latest = data.charts.reduce((max, c) => c.record_number > max.record_number ? c : max, data.charts[0])
          setRecordNumber(latest.record_number)
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
    setError('')

    if (!client || !client.charts || client.charts.length === 0) {
      setError('No chart data to save')
      return
    }

    try {
      const currentChart = client.charts.find(c => c.record_number === recordNumber)
      if (!currentChart) {
        setError('Chart not found')
        return
      }

      if (!workoutGridRef.current) {
        setError('Unable to access workout data')
        return
      }

      const { sessions, exercises } = workoutGridRef.current.getData()

      await updateChart(currentChart.id, {
        sessions: JSON.stringify(sessions),
        exercises: JSON.stringify(exercises)
      })

      setSaveMessage('Workout saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      setError('Failed to save workout. Please try again.')
      console.error(err)
    }
  }

  async function handleSaveNewChart() {
    setError('')

    if (!routineGridRef.current) {
      setError('Unable to access routine data')
      return
    }

    try {
      const { exercises } = routineGridRef.current.getData()
      const newRecordNumber = (client.charts?.length > 0
        ? Math.max(...client.charts.map(c => c.record_number))
        : 0) + 1

      const newChart = await createChart(clientId, newRecordNumber, {
        sessions: JSON.stringify({ date: '', trainer: '', routine: '' }),
        exercises: JSON.stringify({ nameA: '', nameB: '', results: exercises }),
      })

      // Update local state with the new chart
      setClient(prev => ({ ...prev, charts: [...(prev.charts || []), newChart] }))
      setRecordNumber(newRecordNumber)
      setMode('view')
      setSaveMessage('New chart created!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      setError('Failed to create chart. Please try again.')
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
      {mode === 'view' ? (
        <>
          <WorkoutGrid
            ref={workoutGridRef}
            pin={client.pin}
            clientName={client.name}
            recordNumber={recordNumber}
            onRecordChange={setRecordNumber}
            charts={client.charts}
          />

          <div className="button-group">
            <Link to="/clients" className="btn-secondary">
              Back to Clients
            </Link>
            <button className="btn-secondary" onClick={() => setMode('create')}>
              New Chart
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Save Workout
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="workout-header">
            <span>The Exercise Coach</span>
            <span>New Routine — Record #{
              (client.charts?.length > 0
                ? Math.max(...client.charts.map(c => c.record_number))
                : 0) + 1
            }</span>
            <span>PIN: {client.pin}</span>
            <span>{client.name}</span>
          </div>
          <div className="create-chart-layout">
            <RoutineGrid
              ref={routineGridRef}
              recordNumber={
                (client.charts?.length > 0
                  ? Math.max(...client.charts.map(c => c.record_number))
                  : 0) + 1
              }
            />
            <WorkoutOptions />
          </div>

          <div className="button-group">
            <button className="btn-secondary" onClick={() => setMode('view')}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSaveNewChart}>
              Save New Chart
            </button>
          </div>
        </>
      )}

      <ClientInfoCard client={client} />

      {saveMessage && <p className="save-status show">{saveMessage}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  )
}
