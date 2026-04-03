import { useState, useEffect } from 'react'
import { fetchExerciseDefinitions } from '../services/clientService.js'

export default function WorkoutOptions() {
  const [grouped, setGrouped] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExerciseDefinitions()
      .then(data => {
        // Group by category
        const groups = data.reduce((acc, ex) => {
          if (!acc[ex.category]) acc[ex.category] = []
          acc[ex.category].push(ex)
          return acc
        }, {})
        setGrouped(groups)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="workout-options">
      <h3>Available Exercises</h3>
      {loading ? (
        <p style={{ fontSize: '13px', color: '#888' }}>Loading...</p>
      ) : (
        Object.entries(grouped).map(([category, exercises]) => (
          <div key={category} className="workout-options-group">
            <h4>{category}</h4>
            <ul>
              {exercises.map(ex => (
                <li key={ex.id}><span style={{ fontWeight: 700 }}>{ex.code}</span> — {ex.name}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}
