import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import WorkoutGrid from '../components/WorkoutGrid.jsx'
import ClientInfoCard from '../components/ClientInfoCard.jsx'
import { clients } from '../data/clients.js'

export default function ClientPage() {
  const { clientId } = useParams()
  const client = clients.find(c => c.id === Number(clientId))
  const clientName = client ? client.name : 'Client'

  const [recordNumber, setRecordNumber] = useState(1)
  const [saveMessage, setSaveMessage] = useState('')

  function handleSave() {
    // MVP: simulate a save; replace with real API call when backend is ready
    setSaveMessage('Workout saved successfully!')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  return (
    <div className="container">
      {/*
        MVP NOTE:
        This grid mirrors a paper workout chart.
        Inputs make it editable with specific bolding patterns.
      */}
      <WorkoutGrid
        clientName={clientName}
        recordNumber={recordNumber}
        onRecordChange={setRecordNumber}
      />

      <ClientInfoCard />

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
    </div>
  )
}
