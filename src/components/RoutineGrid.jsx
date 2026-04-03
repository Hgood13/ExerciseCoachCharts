import { useState, forwardRef, useImperativeHandle } from 'react'

const DATA_ROWS = 17

function buildInitialRows() {
  return Array.from({ length: DATA_ROWS }, () => ({ colA: '', colB: '' }))
}

export default forwardRef(function RoutineGrid({ clientName, pin, recordNumber }, ref) {
  const [rows, setRows] = useState(buildInitialRows)

  useImperativeHandle(ref, () => ({
    getData: () => ({
      exercises: rows.map((row, idx) => ({ index: idx, nameA: row.colA, nameB: row.colB }))
    }),
    addExercise: (name) => {
      setRows(prev => {
        // Fill colA first (rows 0-16), then colB
        const next = prev.map(r => ({ ...r }))
        const colAIdx = next.findIndex(r => !r.colA)
        if (colAIdx !== -1) {
          next[colAIdx] = { ...next[colAIdx], colA: name }
          return next
        }
        const colBIdx = next.findIndex(r => !r.colB)
        if (colBIdx !== -1) {
          next[colBIdx] = { ...next[colBIdx], colB: name }
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
