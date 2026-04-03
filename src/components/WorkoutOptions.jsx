import { useState, useEffect } from 'react'
import { fetchExerciseDefinitions } from '../services/clientService.js'

const EQUIPMENT_GROUPS = [
  { label: 'Exerbotics', categories: ['Exerbotics'] },
  { label: 'Total Gym', categories: ['Total Gym'] },
  { label: 'Body Weight / Floor / Resistance Band', categories: ['Body Weight / Floor / Resistance Band'] },
  { label: 'Tuff Stuff Multi-Functional Trainer', categories: ['Tuff Stuff Multi-Functional Trainer'] },
  { label: 'SciFit and Nautilus or Tuff Stuff', categories: ['SciFit', 'Nautilus or Tuff Stuff'] },
]

export default function WorkoutOptions({ onSelect }) {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExerciseDefinitions()
      .then(data => setExercises(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="workout-options-container"><p style={{ fontSize: '13px', color: '#888' }}>Loading...</p></div>
  }

  return (
    <div className="workout-options-container">
      {EQUIPMENT_GROUPS.map(group => {
        const groupExercises = exercises.filter(ex => group.categories.includes(ex.category))
        return (
          <div key={group.label} className="workout-options-card">
            <h4 className="workout-options-card-title">{group.label}</h4>
            <ul className="workout-options-list">
              {groupExercises.length === 0 ? (
                <li className="workout-options-empty">No exercises</li>
              ) : (
                groupExercises.map(ex => (
                  <li
                    key={ex.id}
                    onClick={() => onSelect && onSelect(ex.code)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e8f4fd'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                  >
                    <span style={{ fontWeight: 700 }}>{ex.code}</span> — {ex.name}
                  </li>
                ))
              )}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
