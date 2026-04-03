const WORKOUT_OPTIONS = [
  { category: 'Legs', exercises: ['Leg Press', 'Smith Machine Squat', 'Hack Squat', 'Leg Extension', 'Leg Curl', 'Calf Raise', 'Lunge'] },
  { category: 'Chest', exercises: ['Chest Press (Machine)', 'Incline Press', 'Cable Fly', 'Pec Deck', 'Push-Up'] },
  { category: 'Back', exercises: ['Lat Pulldown', 'Seated Row', 'Cable Row', 'Assisted Pull-Up', 'Back Extension'] },
  { category: 'Shoulders', exercises: ['Shoulder Press (Machine)', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Upright Row'] },
  { category: 'Arms', exercises: ['Bicep Curl (Machine)', 'Preacher Curl', 'Tricep Pressdown', 'Overhead Tricep Extension', 'Hammer Curl'] },
  { category: 'Core', exercises: ['Crunch (Machine)', 'Ab Wheel', 'Plank', 'Oblique Crunch', 'Dead Bug'] },
  { category: 'Cardio', exercises: ['Treadmill', 'Elliptical', 'Stationary Bike', 'Rowing Machine', 'Stair Climber'] },
]

export default function WorkoutOptions() {
  return (
    <div className="workout-options">
      <h3>Available Exercises</h3>
      {WORKOUT_OPTIONS.map(group => (
        <div key={group.category} className="workout-options-group">
          <h4>{group.category}</h4>
          <ul>
            {group.exercises.map(exercise => (
              <li key={exercise}>{exercise}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
