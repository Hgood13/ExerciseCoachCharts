import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'

const TRAINER_OPTIONS = ["Aaron", "Bill", "Brandon", "Brendon", "McKenna", "Megan", "Olivia", "Other"]
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

export default forwardRef(function WorkoutGrid({ clientName, pin, recordNumber, onRecordChange, charts = [], onDirty }, ref) {
  const [sessions, setSessions] = useState(buildInitialSessions)
  const [rows, setRows] = useState(buildInitialGrid)
  const [dropdown, setDropdown] = useState(null) // { type, index, rect }
  const [windowStart, setWindowStart] = useState(0)
  const [showChartDropdown, setShowChartDropdown] = useState(false)

  const dropdownRef = useRef(null)
  const chartDropdownRef = useRef(null)
  const chartDropdownTriggerRef = useRef(null)
  const trainerInputRefs = useRef({})

  /* Expose getData method to parent via ref */
  useImperativeHandle(ref, () => ({
    getData: () => ({
      sessions: sessions.map((s, i) => ({
        session_index: i,
        date: s.date,
        trainer: s.trainer,
        routine: s.routine,
      })),
      exercises: rows.map((r, i) => ({
        exercise_index: i,
        routine_a: r.colA,
        routine_b: r.colB,
      })),
      sessionExercises: rows.flatMap((row, rIdx) =>
        row.sessions.map((s, sIdx) => ({
          exercise_index: rIdx,
          session_index: sIdx,
          checked: s.checked,
          note: s.note,
        }))
      ),
    })
  }), [sessions, rows])

  /* Load chart data when recordNumber or charts change */
  useEffect(() => {
    if (charts && charts.length > 0) {
      const currentChart = charts.find(c => c.record_number === recordNumber)
      
      if (currentChart) {
        const sessionMap = {}
        ;(currentChart.chart_sessions || []).forEach(s => { sessionMap[s.session_index] = s })
        const newSessions = Array.from({ length: TOTAL_SESSIONS }, (_, i) =>
          sessionMap[i] ? { date: sessionMap[i].date, trainer: sessionMap[i].trainer, routine: sessionMap[i].routine }
                        : { date: '', trainer: '', routine: '' }
        )
        setSessions(newSessions)

        const exerciseMap = {}
        ;(currentChart.chart_exercises || []).forEach(e => { exerciseMap[e.exercise_index] = e })

        const seMap = {}
        ;(currentChart.chart_session_exercises || []).forEach(se => {
          if (!seMap[se.exercise_index]) seMap[se.exercise_index] = {}
          seMap[se.exercise_index][se.session_index] = se
        })

        const newRows = Array.from({ length: DATA_ROWS }, (_, i) => ({
          colA: exerciseMap[i]?.routine_a || '',
          colB: exerciseMap[i]?.routine_b || '',
          sessions: Array.from({ length: TOTAL_SESSIONS }, (_, j) => ({
            checked: seMap[i]?.[j]?.checked || false,
            note: seMap[i]?.[j]?.note || '',
          })),
        }))
        setRows(newRows)

        const firstEmpty = newSessions.findIndex(s => !s.date && !s.trainer && !s.routine)
        const lastIdx = firstEmpty === -1 ? TOTAL_SESSIONS - 1 : firstEmpty
        setWindowStart(Math.max(0, Math.min(lastIdx - (VISIBLE_SESSIONS - 1), TOTAL_SESSIONS - VISIBLE_SESSIONS)))
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

  /* Close chart selector dropdown when clicking outside */
  useEffect(() => {
    function handleClick(e) {
      if (
        chartDropdownRef.current && !chartDropdownRef.current.contains(e.target) &&
        chartDropdownTriggerRef.current && !chartDropdownTriggerRef.current.contains(e.target)
      ) {
        setShowChartDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  /* ---- session handlers ---- */
  function handleDateClick(idx, currentVal) {
    if (currentVal === '') {
      setSessions(prev => {
        const next = [...prev]
        next[idx] = { ...next[idx], date: todayFormatted }
        return next
      })
      onDirty?.()
    }
  }

  function handleDateChange(idx, val) {
    setSessions(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], date: val }
      return next
    })
    onDirty?.()
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
      closeDropdown()
      onDirty?.()
      setTimeout(() => trainerInputRefs.current[idx]?.focus(), 0)
      return
    } else {
      setSessions(prev => {
        const next = [...prev]
        next[idx] = { ...next[idx], trainer: value }
        return next
      })
    }
    onDirty?.()
    closeDropdown()
  }

  function selectRoutine(idx, value) {
    setSessions(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], routine: value }
      return next
    })
    onDirty?.()
    closeDropdown()
  }

  function handleTrainerChange(idx, val) {
    setSessions(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], trainer: val }
      return next
    })
    onDirty?.()
  }

  /* ---- data row handlers ---- */
  function handleRowChange(rowIdx, field, val) {
    setRows(prev => {
      const next = [...prev]
      next[rowIdx] = { ...next[rowIdx], [field]: val }
      return next
    })
    onDirty?.()
  }

  function handleSessionChange(rowIdx, sIdx, field, val) {
    setRows(prev => {
      const next = [...prev]
      const sessions = [...next[rowIdx].sessions]
      sessions[sIdx] = { ...sessions[sIdx], [field]: val }
      next[rowIdx] = { ...next[rowIdx], sessions }
      return next
    })
    onDirty?.()
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
        <button
          ref={chartDropdownTriggerRef}
          className="record-number-trigger"
          onClick={() => setShowChartDropdown(prev => !prev)}
          aria-haspopup="menu"
          aria-expanded={showChartDropdown}
          aria-label={`Workout Record #${recordNumber}. Click to switch chart`}
        >
          Workout Record: {recordNumber ? `#${recordNumber}` : ''}
          {charts.length > 1 && <span className="record-number-arrow" aria-hidden="true">{showChartDropdown ? '▲' : '▼'}</span>}
        </button>
        {showChartDropdown && charts.length > 0 && (
          <div ref={chartDropdownRef} className="chart-selector-dropdown" role="menu">
            {[...charts]
              .sort((a, b) => b.record_number - a.record_number)
              .map(chart => (
                <div
                  key={chart.id}
                  className={`chart-selector-option${chart.record_number === recordNumber ? ' chart-selector-option--active' : ''}`}
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => {
                    onRecordChange?.(chart.record_number)
                    setShowChartDropdown(false)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onRecordChange?.(chart.record_number)
                      setShowChartDropdown(false)
                    }
                  }}
                >
                  Record #{chart.record_number}
                </div>
              ))}
          </div>
        )}
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
                ref={el => trainerInputRefs.current[absIdx] = el}
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
                  onDirty?.()
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
