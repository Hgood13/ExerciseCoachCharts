// These are react hooks that are used for state magament and DOM refs
import { useState, useEffect, useRef, useCallback } from 'react'

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
  const [editName, setEditName] = useState('')
  const [editPin, setEditPin] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState('') // '' | 'saving' | 'saved' | 'error'
  const workoutGridRef = useRef(null)
  const routineGridRef = useRef(null)
  const clientInfoRef = useRef(null)
  const autoSaveTimer = useRef(null)
  const pendingNewChartId = useRef(null)
  const modeRef = useRef(mode)
  const clientRef = useRef(client)
  const recordNumberRef = useRef(recordNumber)

  // Keep refs in sync so the debounce callback always sees latest values
  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { clientRef.current = client }, [client])
  useEffect(() => { recordNumberRef.current = recordNumber }, [recordNumber])

  const handleAutoSave = useCallback(async () => {
    const currentMode = modeRef.current
    const currentClient = clientRef.current
    const currentRecordNumber = recordNumberRef.current
    if (!currentClient?.charts) return
    const currentChart = currentClient.charts.find(c => c.record_number === currentRecordNumber)
    if (!currentChart) return

    try {
      setAutoSaveStatus('saving')
      if (currentMode === 'view' && workoutGridRef.current) {
        const { sessions, exercises, sessionExercises } = workoutGridRef.current.getData()
        await saveChartData(currentChart.id, { sessions, exercises, sessionExercises })
      } else if ((currentMode === 'edit-routine' || currentMode === 'create') && routineGridRef.current) {
        const chartId = currentMode === 'create'
          ? pendingNewChartId.current || currentChart?.id
          : currentChart?.id
        if (!chartId) return
        const { exercises } = routineGridRef.current.getData()
        await saveChartData(chartId, { exercises })
        setClient(prev => ({
          ...prev,
          charts: prev.charts.map(c =>
            c.id === chartId
              ? { ...c, chart_exercises: exercises.map(e => ({ chart_id: chartId, ...e })) }
              : c
          )
        }))
      }
      setAutoSaveStatus('saved')
      setTimeout(() => setAutoSaveStatus(''), 2000)
    } catch (err) {
      console.error('Auto-save failed:', err)
      setAutoSaveStatus('error')
      setTimeout(() => setAutoSaveStatus(''), 3000)
    }
  }, [])

  const handleDirty = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(handleAutoSave, 4000)
  }, [handleAutoSave])

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
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
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
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
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

      await Promise.all([
        saveChartData(currentChart.id, { exercises }),
        updateClient(clientId, { name: editName, pin: editPin })
      ])

      // Update local state
      setClient(prev => ({
        ...prev,
        name: editName,
        pin: editPin,
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
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    if (!routineGridRef.current) return
    const chartId = pendingNewChartId.current || client.charts?.find(c => c.record_number === recordNumber)?.id
    if (!chartId) {
      setError('Chart not found — please try again.')
      return
    }
    try {
      const { exercises } = routineGridRef.current.getData()
      await saveChartData(chartId, { exercises })
      setClient(prev => ({
        ...prev,
        charts: prev.charts.map(c =>
          c.id === chartId
            ? { ...c, chart_exercises: exercises.map(e => ({ chart_id: chartId, ...e })) }
            : c
        )
      }))
      pendingNewChartId.current = null
    } catch (err) {
      setError('Failed to save new chart routine.')
      console.error('Failed to save new chart routine:', err)
      return
    }
    setMode('view')
    setSaveMessage('New chart created!')
    setTimeout(() => setSaveMessage(''), 3000)
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
          onDirty={handleDirty}
        />
      ) : mode === 'edit-routine' ? (
        <>
          <div className="workout-header">
            <span>The Exercise Coach</span>
            <span>Edit Routine — Record #{recordNumber}</span>
            <span>PIN: <input value={editPin} onChange={e => setEditPin(e.target.value)} className="header-input" /></span>
            <span><input value={editName} onChange={e => setEditName(e.target.value)} className="header-input" /></span>
          </div>
          <div className="create-chart-layout">
            <RoutineGrid
              ref={routineGridRef}
              recordNumber={recordNumber}
              onDirty={handleDirty}
            />
            <WorkoutOptions onSelect={name => routineGridRef.current?.addExercise(name)} />
          </div>
        </>
      ) : (
        <>
          <div className="workout-header">
            <span>The Exercise Coach</span>
            <span>New Routine — Record #{recordNumber}</span>
            <span>PIN: {client.pin}</span>
            <span>{client.name}</span>
          </div>
          <div className="create-chart-layout">
            <RoutineGrid
              ref={routineGridRef}
              recordNumber={recordNumber}
              onDirty={handleDirty}
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
                setEditName(client.name)
                setEditPin(client.pin)
                setMode('edit-routine')
                setTimeout(() => routineGridRef.current?.loadExercises(exercisesToLoad), 0)
              } else {
                setEditName(client.name)
                setEditPin(client.pin)
                setMode('edit-routine')
              }
            }}>
              Edit Routine or Chart
            </button>
            <button className="btn-secondary" onClick={async () => {
              const newRecordNumber = (client.charts?.length > 0
                ? Math.max(...client.charts.map(c => c.record_number))
                : 0) + 1
              const newChart = await createChart(clientId, newRecordNumber)
              pendingNewChartId.current = newChart.id
              setClient(prev => ({ ...prev, charts: [...(prev.charts || []), newChart] }))
              setRecordNumber(newRecordNumber)
              setMode('create')
            }}>
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

      {autoSaveStatus === 'saving' && <p className="save-status show">Saving...</p>}
      {autoSaveStatus === 'saved' && <p className="save-status show">Saved ✓</p>}
      {autoSaveStatus === 'error' && <p className="error-message">Auto-save failed</p>}
      {saveMessage && <p className="save-status show">{saveMessage}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  )
}
