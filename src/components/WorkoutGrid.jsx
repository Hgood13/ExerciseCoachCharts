import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'

const TRAINER_OPTIONS = ["Aaron", "Bill", "Brandon", "Megan", "Other"]
const ROUTINE_OPTIONS = ["A", "B"]
const DATA_ROWS = 16

const TOTAL_SESSIONS = 14
const VISIBLE_SESSIONS = 7

function buildInitialGrid() {
  return Array.from({ length: DATA_ROWS }, () => ({
    colA: '',
    colB: '',
    sessions: Array.from({ length: TOTAL_SESSIONS }, () => ({ checked: false, note: '' })),
  }))
}

function buildInitialSessions() {
  return Array.from({ length: TOTAL_SESSIONS }, () => ({ date: '', trainer: '', routine: '' }))
}

export default forwardRef(function WorkoutGrid({ clientName, pin, recordNumber, onRecordChange, charts = [] }, ref) {
  const [sessions, setSessions] = useState(buildInitialSessions)
  const [rows, setRows] = useState(buildInitialGrid)
  const [dropdown, setDropdown] = useState(null) // { type, index, rect }
  const [windowStart, setWindowStart] = useState(0)

  const dropdownRef = useRef(null)

  /* Expose getData method to parent via ref */
  useImperativeHandle(ref, () => ({
    getData: () => ({
      sessions: JSON.stringify(sessions),
      exercises: JSON.stringify({
        rows: rows.map((row, idx) => ({
          index: idx,
          nameA: row.colA,
          nameB: row.colB,
          sessions: row.sessions,
        }))
      })
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
          if (Array.isArray(sessionsData) && sessionsData.length > 0) {
            // New format: array of session headers
            const padded = Array.from({ length: TOTAL_SESSIONS }, (_, i) => sessionsData[i] || { date: '', trainer: '', routine: '' })
            setSessions(padded)
            const firstEmpty = padded.findIndex(s => !s.date || !s.trainer || !s.routine)
            const lastIdx = firstEmpty === -1 ? TOTAL_SESSIONS - 1 : firstEmpty
            setWindowStart(Math.max(0, Math.min(lastIdx - (VISIBLE_SESSIONS - 1), TOTAL_SESSIONS - VISIBLE_SESSIONS)))
          } else if (sessionsData && typeof sessionsData === 'object' && (sessionsData.date || sessionsData.trainer || sessionsData.routine)) {
            // Legacy format: single session object
            setSessions([sessionsData, ...Array(TOTAL_SESSIONS - 1).fill({ date: '', trainer: '', routine: '' })])
            setWindowStart(0)
          }

          // Load exercises into the rows
          if (exercisesData) {
            let newRows = []

            if (exercisesData.rows) {
              // New format: { rows: [{ index, nameA, nameB, sessions? }] }
              newRows = exercisesData.rows.map(row => ({
                colA: row.nameA || '',
                colB: row.nameB || '',
                sessions: row.sessions
                  ? row.sessions.map(s =>
                      s && typeof s === 'object'
                        ? { checked: s.checked || false, note: s.note || '' }
                        : { checked: false, note: typeof s === 'string' ? s : '' }
                    ).concat(Array.from({ length: Math.max(0, TOTAL_SESSIONS - (row.sessions.length || 0)) }, () => ({ checked: false, note: '' })))
                  : Array.from({ length: TOTAL_SESSIONS }, () => ({ checked: false, note: '' }))
              }))
            } else if (exercisesData.results) {
              // Old format: { nameA, nameB, results: [{ weight, reps, notes }] }
              newRows = exercisesData.results.map(result => ({
                colA: exercisesData.nameA || '',
                colB: exercisesData.nameB || '',
                sessions: Array.from({ length: TOTAL_SESSIONS }, (_, i) => ({
                  checked: false,
                  note: [result.weight, result.reps, result.notes][i] || ''
                }))
              }))
            }

            // Pad with empty rows to reach DATA_ROWS
            while (newRows.length < DATA_ROWS) {
              newRows.push({ colA: '', colB: '', sessions: Array.from({ length: TOTAL_SESSIONS }, () => ({ checked: false, note: '' })) })
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

  function handleSessionChange(rowIdx, sIdx, field, val) {
    setRows(prev => {
      const next = [...prev]
      const sessions = [...next[rowIdx].sessions]
      sessions[sIdx] = { ...sessions[sIdx], [field]: val }
      next[rowIdx] = { ...next[rowIdx], sessions }
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

  /* ---- windowed view ---- */
  const visibleSessions = sessions.slice(windowStart, windowStart + VISIBLE_SESSIONS)

  return (
    <>
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
          {visibleSessions.map((s, i) => {
            const absIdx = windowStart + i
            return (
              <input
                key={absIdx}
                value={s.date}
                onClick={() => handleDateClick(absIdx, s.date)}
                onChange={e => handleDateChange(absIdx, e.target.value)}
              />
            )
          })}
        </div>

        {/* Row 2: Trainer */}
        <div className="grid-row wide-cells bold">
          <input readOnly value="Trainer" />
          {visibleSessions.map((s, i) => {
            const absIdx = windowStart + i
            return (
              <input
                key={absIdx}
                value={s.trainer}
                onClick={e => handleTrainerClick(absIdx, e)}
                onChange={e => handleTrainerChange(absIdx, e.target.value)}
              />
            )
          })}
        </div>

        {/* Row 3: Routine */}
        <div className="grid-row wide-cells bold">
          <input readOnly value="Routine" />
          {visibleSessions.map((s, i) => {
            const absIdx = windowStart + i
            return (
              <input
                key={absIdx}
                value={s.routine}
                onClick={e => handleRoutineClick(absIdx, e)}
                onChange={e => {
                  setSessions(prev => {
                    const next = [...prev]
                    next[absIdx] = { ...next[absIdx], routine: e.target.value }
                    return next
                  })
                }}
              />
            )
          })}
        </div>

        {/* Row 4: Session numbering */}
        <div className="grid-row bold">
          <input readOnly value="A" />
          <input readOnly value="B" />
          {visibleSessions.map((_, i) => (
            <input key={i} readOnly className="span-2" value={`${windowStart + i + 1} of ${TOTAL_SESSIONS}`} />
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
            {visibleSessions.map((_, i) => {
              const absIdx = windowStart + i
              const cell = row.sessions[absIdx] || { checked: false, note: '' }
              return (
                <div key={absIdx} className="session-cell span-2">
                  <input
                    type="checkbox"
                    className="session-checkbox"
                    checked={cell.checked}
                    onChange={e => handleSessionChange(rIdx, absIdx, 'checked', e.target.checked)}
                  />
                  <input
                    className="session-note"
                    value={cell.note}
                    onChange={e => handleSessionChange(rIdx, absIdx, 'note', e.target.value)}
                  />
                </div>
              )
            })}
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
