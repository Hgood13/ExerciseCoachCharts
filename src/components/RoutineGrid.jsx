import { useState, forwardRef, useImperativeHandle } from 'react'

const DATA_ROWS = 16

function buildInitialRows() {
  return Array.from({ length: DATA_ROWS }, () => ({ colA: '', colB: '' }))
}

export default forwardRef(function RoutineGrid({ clientName, pin, recordNumber, onDirty }, ref) {
  const [rows, setRows] = useState(buildInitialRows)

  useImperativeHandle(ref, () => ({
    getData: () => ({
      exercises: rows.map((row, idx) => ({ exercise_index: idx, routine_a: row.colA, routine_b: row.colB }))
    }),
    loadExercises: (exercises) => {
      setRows(Array.from({ length: DATA_ROWS }, (_, i) => ({
        // support both new (routine_a/routine_b) and legacy (nameA/nameB) shapes
        colA: exercises[i]?.routine_a ?? exercises[i]?.nameA ?? '',
        colB: exercises[i]?.routine_b ?? exercises[i]?.nameB ?? '',
      })))
    },
    addExercise: (name) => {
      setRows(prev => {
        const next = prev.map(r => ({ ...r }))
        const colAIdx = next.findIndex(r => !r.colA)
        if (colAIdx !== -1) {
          next[colAIdx] = { ...next[colAIdx], colA: name }
          onDirty?.()
          return next
        }
        const colBIdx = next.findIndex(r => !r.colB)
        if (colBIdx !== -1) {
          next[colBIdx] = { ...next[colBIdx], colB: name }
          onDirty?.()
        }
        return next
      })
    }
  }), [rows])

  function handleChange(rowIdx, field, val) {
    setRows(prev => {
      const next = [...prev]
      next[rowIdx] = { ...next[rowIdx], [field]: val }
      return next
    })
    onDirty?.()
  }

  return (
    <div className="routine-grid">
        {/* Column headers */}
        <input readOnly value="Routine A" />
        <input readOnly value="Routine B" />

        {rows.map((row, rIdx) => (
          <>
            <input
              key={`a-${rIdx}`}
              value={row.colA}
              onChange={e => handleChange(rIdx, 'colA', e.target.value)}
            />
            <input
              key={`b-${rIdx}`}
              value={row.colB}
              onChange={e => handleChange(rIdx, 'colB', e.target.value)}
            />
          </>
        ))}
      </div>
  )
})
