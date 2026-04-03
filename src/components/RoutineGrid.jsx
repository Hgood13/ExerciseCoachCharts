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
    })
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
              placeholder={`A${rIdx + 1}`}
              onChange={e => handleChange(rIdx, 'colA', e.target.value)}
            />
            <input
              key={`b-${rIdx}`}
              value={row.colB}
              placeholder={`B${rIdx + 1}`}
              onChange={e => handleChange(rIdx, 'colB', e.target.value)}
            />
          </>
        ))}
      </div>
  )
})
