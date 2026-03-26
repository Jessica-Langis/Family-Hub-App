import { useState, useEffect, useCallback } from 'react'
import Panel, { PanelHeader } from '../../components/Panel/Panel'
import { SCRIPTS, CALENDAR, apiFetch } from '../../api/scripts'
import { getDayDiff, formatDateShort } from '../Home/homeUtils'
import './Parentals.css'

// ── helpers ──────────────────────────────────────────────────
function choreBadgeCls(dateStr) {
  const diff = getDayDiff(dateStr)
  if (isNaN(diff)) return 'upcoming'
  if (diff < 0)    return 'past'
  if (diff === 0)  return 'today'
  if (diff <= 7)   return 'soon'
  return 'upcoming'
}

const MEAL_DAYS_LEFT  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
const MEAL_DAYS_RIGHT = ['Friday', 'Saturday', 'Sunday', 'Meal Prep']

// ── Parentals tab ─────────────────────────────────────────────
export default function Parentals() {
  return (
    <div className="parentals-grid">
      <TodoPanel />
      <MealsPanel />
      <AgendaPanel />
    </div>
  )
}

// ── To Do panel ───────────────────────────────────────────────
function TodoPanel() {
  const [chores, setChores]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res  = await apiFetch(`${SCRIPTS.CHORES}?type=chores`)
      const data = await res.json()
      const filtered = data
        .filter(c => c.who !== 'tori' && c.who !== 'nova')
        .sort((a, b) => {
          const da = getDayDiff(a.dueDate), db = getDayDiff(b.dueDate)
          if (isNaN(da) && isNaN(db)) return 0
          if (isNaN(da)) return 1
          if (isNaN(db)) return -1
          return da - db
        })
      setChores(filtered)
    } catch (e) {
      console.error('chores load', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function toggle(idx, done) {
    const updated = chores.map((c, i) => i === idx ? { ...c, done: !done } : c)
    setChores(updated)
    try {
      const fd = new FormData()
      fd.append('action', 'toggle')
      fd.append('type', 'chores')
      fd.append('idx', String(idx))
      fd.append('done', String(!done))
      await apiFetch(SCRIPTS.CHORES, { method: 'POST', body: fd })
    } catch (e) {
      console.error('toggle chore', e)
      setChores(chores)
    }
  }

  return (
    <Panel>
      <PanelHeader title="To Do" badge="family" />
      {loading
        ? <div className="chore-empty">Loading…</div>
        : chores.length === 0
          ? <div className="chore-empty">All caught up!</div>
          : <div className="chore-list">
              {chores.map((c, i) => {
                const badge = c.dueDate ? choreBadgeCls(c.dueDate) : null
                return (
                  <div key={c.id ?? i} className="chore-item">
                    <input
                      type="checkbox"
                      checked={!!c.done}
                      onChange={() => toggle(i, !!c.done)}
                    />
                    <span className={`chore-item-name${c.done ? ' done' : ''}`}>{c.name}</span>
                    {c.who && <span className="chore-item-who">{c.who}</span>}
                    {badge && (
                      <span className={`countdown-badge ${badge}`}>
                        {c.dueDate ? formatDateShort(c.dueDate) : ''}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
      }
    </Panel>
  )
}

// ── Meals panel ───────────────────────────────────────────────
function MealsPanel() {
  const [meals, setMeals]     = useState({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // day string | null
  const [draft, setDraft]     = useState('')

  useEffect(() => {
    apiFetch(SCRIPTS.MEAL)
      .then(r => r.json())
      .then(data => setMeals(data))
      .catch(e => console.error('meals load', e))
      .finally(() => setLoading(false))
  }, [])

  function startEdit(day) {
    setEditing(day)
    setDraft(meals[day] || '')
  }

  async function saveMeal(day, value) {
    const prev = meals
    setMeals(m => ({ ...m, [day]: value || '' }))
    setEditing(null)
    try {
      const fd = new FormData()
      fd.append('day', day)
      fd.append('meal', value || '__CLEAR__')
      await apiFetch(SCRIPTS.MEAL, { method: 'POST', body: fd })
    } catch (e) {
      console.error('save meal', e)
      setMeals(prev)
    }
  }

  function renderDay(day) {
    const val = meals[day] || ''
    if (editing === day) {
      return (
        <div key={day} className="meal-item">
          <span className="meal-item-day">{day}</span>
          <div className="meal-edit-row">
            <input
              className="meal-input"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') saveMeal(day, draft)
                if (e.key === 'Escape') setEditing(null)
              }}
              autoFocus
            />
            <button className="meal-save-btn"  onClick={() => saveMeal(day, draft)}>✓</button>
            <button className="meal-clear-btn" onClick={() => saveMeal(day, '')}>✕</button>
          </div>
        </div>
      )
    }
    return (
      <div key={day} className="meal-item" onClick={() => startEdit(day)}>
        <span className="meal-item-day">{day}</span>
        <span className={`meal-item-name${!val ? ' empty' : ''}`}>{val || 'tap to set'}</span>
      </div>
    )
  }

  return (
    <Panel>
      <PanelHeader title="What's for Dinner" />
      {loading
        ? <div className="chore-empty">Loading…</div>
        : <div className="meal-grid-2col">
            <div>
              <div className="meal-col-label">Mon – Thu</div>
              {MEAL_DAYS_LEFT.map(renderDay)}
            </div>
            <div>
              <div className="meal-col-label">Fri – Prep</div>
              {MEAL_DAYS_RIGHT.map(renderDay)}
            </div>
          </div>
      }
    </Panel>
  )
}

// ── Agenda panel (Google Calendar iframe) ─────────────────────
function AgendaPanel() {
  return (
    <Panel className="agenda-panel">
      <PanelHeader title="Calendar" />
      <div className="agenda-iframe-wrap">
        <iframe
          src={CALENDAR.FAMILY_EMBED}
          title="Family Calendar"
          frameBorder="0"
          scrolling="no"
          className="agenda-iframe"
        />
      </div>
    </Panel>
  )
}
