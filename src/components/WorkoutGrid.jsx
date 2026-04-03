import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'

const TRAINER_OPTIONS = ["Aaron", "Bill", "Brandon", "Megan", "Other"]
const ROUTINE_OPTIONS = ["A", "B"]
const DATA_ROWS = 16

function buildInitialGrid() {
  return Array.from({ length: DATA_ROWS }, () => ({
    colA: '',
    colB: '',
    sessions: Array.from({ length: 7 }, () => ({ checked: false, note: '' })),
  }))
}

function buildInitialSessions() {
  return Array.from({ length: 7 }, () => ({ date: '', trainer: '', routine: '' }))
}

export default forwardRef(function WorkoutGrid({ clientName, pin, recordNumber, onRecordChange, charts = [] }, ref) {
  const [sessions, setSessions] = useState(buildInitialSessions)
  const [rows, setRows] = useState(buildInitialGrid)
  const [dropdown, setDropdown] = useState(null) // { type, index, rect }

  const dropdownRef = useRef(null)

  /* Expose getData method to parent via ref */
  useImperativeHandle(ref, () => ({
    getData: () => ({
      sessions: sessions[0] || { date: '', trainer: '', routine: '' },
      exercises: {
        rows: rows.map((row, idx) => ({
          index: idx,
          nameA: row.colA,
          nameB: row.colB,
          sessions: row.sessions.map(s => ({ checked: s.checked, note: s.note })),
        })),
      },
    })
  }), [sessions, rows])

  /* Load chart data when recordNumber or charts change */
  useEffect(() => {
    if (charts && charts.length > 0) {
      // Find the chart matching the current recordNumber
      const currentChart = charts.find(c => c.record_number === recordNumber)
      
      if (currentChart) {
        // Parse the JSON strings from the database
        try {
          const sessionsData = typeof currentChart.sessions === 'string' 
            ? JSON.parse(currentChart.sessions) 
            : currentChart.sessions
          const exercisesData = typeof currentChart.exercises === 'string' 
            ? JSON.parse(currentChart.exercises) 
            : currentChart.exercises

          // Load sessions into the grid
          if (sessionsData && (sessionsData.date || sessionsData.trainer || sessionsData.routine)) {
            setSessions([sessionsData, ...Array(6).fill({ date: '', trainer: '', routine: '' })])
          }

          // Load exercises into the rows
          if (exercisesData) {
            let newRows = []

            if (exercisesData.rows) {
              // New format: { rows: [{ index, nameA, nameB, sessions? }] }
              newRows = exercisesData.rows.map(row => ({
                colA: row.nameA || '',
                colB: row.nameB || '',
                sessions: Array.from({ length: 7 }, (_, i) => {
                  const s = row.sessions?.[i]
                  if (s == null) return { checked: false, note: '' }
                  if (typeof s === 'string') return { checked: false, note: s }
                  return { checked: Boolean(s.checked), note: s.note || '' }
                }),
              }))
            } else if (exercisesData.results) {
              // Old format: { nameA, nameB, results: [{ weight, reps, notes }] }
              newRows = exercisesData.results.map(result => ({
                colA: exercisesData.nameA || '',
                colB: exercisesData.nameB || '',
                sessions: [
                  { checked: false, note: result.weight || '' },
                  { checked: false, note: result.reps || '' },
                  { checked: false, note: result.notes || '' },
                  { checked: false, note: '' },
                  { checked: false, note: '' },
                  { checked: false, note: '' },
                  { checked: false, note: '' },
                ],
              }))
            }

            // Pad with empty rows to reach DATA_ROWS
            while (newRows.length < DATA_ROWS) {
              newRows.push({ colA: '', colB: '', sessions: Array.from({ length: 7 }, () => ({ checked: false, note: '' })) })
            }

            setRows(newRows)
          }
        } catch (err) {
          console.error('Error parsing chart data:', err)
        }
      }
    }
  }, [recordNumber, charts])

  /* ---- helpers ---- */
  const todayFormatted = (() => {
    const d = new Date()
    return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`
  })()

  const closeDropdown = useCallback(() => setDropdown(null), [])

  /* Close dropdown when clicking outside */
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closeDropdown()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [closeDropdown])

  /* ---- session handlers ---- */
  function handleDateClick(idx, currentVal) {
    if (currentVal === '') {
      setSessions(prev => {
        const next = [...prev]
        next[idx] = { ...next[idx], date: todayFormatted }
        return next
      })
    }
  }

  function handleDateChange(idx, val) {
    setSessions(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], date: val }
      return next
    })
  }

  function handleTrainerClick(idx, e) {
    const rect = e.currentTarget.getBoundingClientRect()
    setDropdown({ type: 'trainer', index: idx, rect })
  }

  function handleRoutineClick(idx, e) {
    const rect = e.currentTarget.getBoundingClientRect()
    setDropdown({ type: 'routine', index: idx, rect })
  }

  function selectTrainer(idx, value) {
    if (value === 'Other') {
      setSessions(prev => {
        const next = [...prev]
        next[idx] = { ...next[idx], trainer: '' }
        return next
      })
    } else {
      setSessions(prev => {
        const next = [...prev]
        next[idx] = { ...next[idx], trainer: value }
        return next
      })
    }
    closeDropdown()
  }

  function selectRoutine(idx, value) {
    setSessions(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], routine: value }
      return next
    })
    closeDropdown()
  }

  function handleTrainerChange(idx, val) {
    setSessions(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], trainer: val }
      return next
    })
  }

  /* ---- data row handlers ---- */
  function handleRowChange(rowIdx, field, val) {
    setRows(prev => {
      const next = [...prev]
      next[rowIdx] = { ...next[rowIdx], [field]: val }
      return next
    })
  }

  function handleSessionCheck(rowIdx, sIdx, checked) {
    setRows(prev => {
      const next = [...prev]
      const sessionsCopy = [...next[rowIdx].sessions]
      sessionsCopy[sIdx] = { ...sessionsCopy[sIdx], checked }
      next[rowIdx] = { ...next[rowIdx], sessions: sessionsCopy }
      return next
    })
  }

  function handleSessionNote(rowIdx, sIdx, note) {
    setRows(prev => {
      const next = [...prev]
      const sessionsCopy = [...next[rowIdx].sessions]
      sessionsCopy[sIdx] = { ...sessionsCopy[sIdx], note }
      next[rowIdx] = { ...next[rowIdx], sessions: sessionsCopy }
      return next
    })
  }

  /* ---- new chart ---- */
  function handleNewChart() {
    setSessions(buildInitialSessions())
    setRows(buildInitialGrid())
    if (onRecordChange) onRecordChange(recordNumber + 1)
  }

  /* ---- dropdown positioning ---- */
  function getDropdownStyle(rect) {
    if (!rect) return {}
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft
    return {
      position: 'absolute',
      top: rect.bottom + scrollTop + 5,
      left: rect.left + scrollLeft,
      minWidth: rect.width,
      zIndex: 1000,
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }
  }

  const options = dropdown?.type === 'trainer' ? TRAINER_OPTIONS : ROUTINE_OPTIONS
  const selectFn = dropdown?.type === 'trainer' ? selectTrainer : selectRoutine

  return (
    <>
      {/* Workout header bar */}
      <div className="workout-header">
        <span>The Exercise Coach</span>
        <span>Workout Record: {recordNumber ? `#${recordNumber}` : ''}</span>
        <span>PIN: {pin}</span>
        <span>{clientName}</span>
      </div>

      {/* Grid */}
      <div className="workout-grid">
        {/* Row 1: Date */}
        <div className="grid-row wide-cells bold">
          <input readOnly value="Date" />
          {sessions.map((s, i) => (
            <input
              key={i}
              value={s.date}
              onClick={() => handleDateClick(i, s.date)}
              onChange={e => handleDateChange(i, e.target.value)}
            />
          ))}
        </div>

        {/* Row 2: Trainer */}
        <div className="grid-row wide-cells bold">
          <input readOnly value="Trainer" />
          {sessions.map((s, i) => (
            <input
              key={i}
              value={s.trainer}
              onClick={e => handleTrainerClick(i, e)}
              onChange={e => handleTrainerChange(i, e.target.value)}
              readOnly={false}
            />
          ))}
        </div>

        {/* Row 3: Routine */}
        <div className="grid-row wide-cells bold">
          <input readOnly value="Routine" />
          {sessions.map((s, i) => (
            <input
              key={i}
              value={s.routine}
              onClick={e => handleRoutineClick(i, e)}
              onChange={e => {
                setSessions(prev => {
                  const next = [...prev]
                  next[i] = { ...next[i], routine: e.target.value }
                  return next
                })
              }}
            />
          ))}
        </div>

        {/* Row 4: Exercise column headers */}
        <div className="grid-row bold">
          <input readOnly value="A" />
          <input readOnly value="B" />
          {Array(7).fill(null).map((_, i) => (
            <input key={i} readOnly className="span-2" />
          ))}
        </div>

        {/* Rows 5-18: Data rows */}
        {rows.map((row, rIdx) => (
          <div className="grid-row" key={rIdx}>
            <input
              className="small-text"
              value={row.colA}
              onChange={e => handleRowChange(rIdx, 'colA', e.target.value)}
            />
            <input
              className="small-text"
              value={row.colB}
              onChange={e => handleRowChange(rIdx, 'colB', e.target.value)}
            />
            {row.sessions.map((cell, sIdx) => (
              <div key={sIdx} className="session-cell span-2">
                <input
                  type="checkbox"
                  checked={cell.checked}
                  onChange={e => handleSessionCheck(rIdx, sIdx, e.target.checked)}
                />
                <input
                  className="session-note"
                  value={cell.note}
                  onChange={e => handleSessionNote(rIdx, sIdx, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Floating dropdown */}
      {dropdown && (
        <div ref={dropdownRef} style={getDropdownStyle(dropdown.rect)}>
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => selectFn(dropdown.index, opt)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                fontSize: '14px',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </>
  )
})
