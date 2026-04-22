// These are react hooks that are used for state magament and DOM refs
import { useState, useEffect, useRef } from 'react'

// Link is for navigation, useParams is for clientId from URL
// q - Any reason for using link instead of useNavigate like LoginPage?
// q - How is clientId used?
import { Link, useParams } from 'react-router-dom'

// The component imports are as they seem, UI React components
import WorkoutGrid from '../components/WorkoutGrid.jsx'
import RoutineGrid from '../components/RoutineGrid.jsx'
import WorkoutOptions from '../components/WorkoutOptions.jsx'
import ClientInfoCard from '../components/ClientInfoCard.jsx'

// These our our supabase services 
import { fetchClientWithCharts, updateClient, createChart, saveChartData } from '../services/clientService.js'

// This is the main component for the client page
export default function ClientPage() {
  // First, we have our state variables and refs
  // Starting with clientId which is obtained from the URL parameters using getParams
  const { clientId } = useParams()  
  // Next client data. The client object and a setter function to update it
  const [client, setClient] = useState(null)
  // Loading state object and setter to indicate whether the client data is being fetched
  const [loading, setLoading] = useState(true)
  // Error state object and setter to indicate whether there was an error fetching or saving data
  const [error, setError] = useState('')
  const [recordNumber, setRecordNumber] = useState(1)
  const [saveMessage, setSaveMessage] = useState('')
  const [mode, setMode] = useState('view') // 'view' | 'create' | 'edit-routine'
  const workoutGridRef = useRef(null)
  const routineGridRef = useRef(null)
  const clientInfoRef = useRef(null)

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

      const { sessions, exercises, sessionExercises } = workoutGridRef.current.getData()

      const clientInfo = clientInfoRef.current?.getData()

      await Promise.all([
        saveChartData(currentChart.id, { sessions, exercises, sessionExercises }),
        clientInfo && updateClient(clientId, clientInfo)
      ])

      // Update local chart state so WorkoutGrid re-runs its load effect
      setClient(prev => ({
        ...prev,
        charts: prev.charts.map(c =>
          c.id === currentChart.id
            ? {
                ...c,
                chart_sessions: sessions.map(s => ({ chart_id: c.id, ...s })),
                chart_exercises: exercises.map(e => ({ chart_id: c.id, ...e })),
                chart_session_exercises: sessionExercises.map(se => ({ chart_id: c.id, ...se })),
              }
            : c
        )
      }))

      setSaveMessage('Workout saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      setError('Failed to save workout. Please try again.')
      console.error(err)
    }
  }

  async function handleSaveRoutine() {
    setError('')

    if (!routineGridRef.current) {
      setError('Unable to access routine data')
      return
    }

    try {
      const currentChart = client.charts.find(c => c.record_number === recordNumber)
      if (!currentChart) {
        setError('Chart not found')
        return
      }

      const { exercises } = routineGridRef.current.getData()

      await saveChartData(currentChart.id, { exercises })

      // Update local state
      setClient(prev => ({
        ...prev,
        charts: prev.charts.map(c =>
          c.id === currentChart.id
            ? { ...c, chart_exercises: exercises.map(e => ({ chart_id: c.id, ...e })) }
            : c
        )
      }))

      setMode('view')
      setSaveMessage('Routine saved!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      setError('Failed to save routine. Please try again.')
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

      const newChart = await createChart(clientId, newRecordNumber)
      await saveChartData(newChart.id, { exercises })

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
        <WorkoutGrid
          ref={workoutGridRef}
          pin={client.pin}
          clientName={client.name}
          recordNumber={recordNumber}
          onRecordChange={setRecordNumber}
          charts={client.charts}
        />
      ) : mode === 'edit-routine' ? (
        <>
          <div className="workout-header">
            <span>The Exercise Coach</span>
            <span>Edit Routine — Record #{recordNumber}</span>
            <span>PIN: {client.pin}</span>
            <span>{client.name}</span>
          </div>
          <div className="create-chart-layout">
            <RoutineGrid
              ref={routineGridRef}
              recordNumber={recordNumber}
            />
            <WorkoutOptions onSelect={name => routineGridRef.current?.addExercise(name)} />
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
            <WorkoutOptions onSelect={name => routineGridRef.current?.addExercise(name)} />
          </div>
        </>
      )}

      <ClientInfoCard client={client} ref={clientInfoRef} />

      <div className="button-group">
        {mode === 'view' ? (
          <>
            <Link to="/clients" className="btn-secondary">
              Back to Clients
            </Link>
            <button className="btn-secondary" onClick={() => {
              const currentChart = client.charts.find(c => c.record_number === recordNumber)
              if (currentChart) {
                // Prefer new normalized exercises, fall back to legacy blob
                let exercisesToLoad = currentChart.chart_exercises || []
                if (exercisesToLoad.length === 0 && currentChart.exercises) {
                  try {
                    const parsed = JSON.parse(currentChart.exercises)
                    exercisesToLoad = parsed.rows || []
                  } catch { exercisesToLoad = [] }
                }
                setMode('edit-routine')
                setTimeout(() => routineGridRef.current?.loadExercises(exercisesToLoad), 0)
              } else {
                setMode('edit-routine')
              }
            }}>
              Edit Routine
            </button>
            <button className="btn-secondary" onClick={() => setMode('create')}>
              New Chart
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Save Workout
            </button>
          </>
        ) : mode === 'edit-routine' ? (
          <>
            <button className="btn-secondary" onClick={() => setMode('view')}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSaveRoutine}>
              Save Routine
            </button>
          </>
        ) : (
          <>
            <button className="btn-secondary" onClick={() => setMode('view')}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSaveNewChart}>
              Save New Chart
            </button>
          </>
        )}
      </div>

      {saveMessage && <p className="save-status show">{saveMessage}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  )
}
