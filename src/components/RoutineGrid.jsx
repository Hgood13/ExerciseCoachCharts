import { useState, forwardRef, useImperativeHandle } from 'react'

const DATA_ROWS = 14

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
    <>
      {/* Header bar */}
      <div className="workout-header">
        <span>The Exercise Coach</span>
        <span>New Routine — Record #{recordNumber}</span>
        <span>PIN: {pin}</span>
        <span>{clientName}</span>
      </div>

      {/* Grid */}
      <div className="workout-grid">
        {/* Column headers */}
        <div className="grid-row bold">
          <input readOnly value="Exercise A" />
          <input readOnly value="Exercise B" />
        </div>

        {rows.map((row, rIdx) => (
          <div className="grid-row" key={rIdx}>
            <input
              className="small-text"
              value={row.colA}
              placeholder="Exercise A name"
              onChange={e => handleChange(rIdx, 'colA', e.target.value)}
            />
            <input
              className="small-text"
              value={row.colB}
              placeholder="Exercise B name"
              onChange={e => handleChange(rIdx, 'colB', e.target.value)}
            />
          </div>
        ))}
      </div>
    </>
  )
})
