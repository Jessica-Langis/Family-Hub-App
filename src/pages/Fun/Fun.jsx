import { useState, useEffect, useCallback } from 'react'
import Panel, { PanelHeader } from '../../components/Panel/Panel'
import { SCRIPTS, apiFetch } from '../../api/scripts'
import './Fun.css'

// ── Shared list item ──────────────────────────────────────
function FunItem({ item, titleKey, subKey, onDelete }) {
  const title = item[titleKey] || ''
  const sub   = subKey && item[subKey] ? item[subKey] : null
  const tag   = item.type || null

  return (
    <div className="fun-item">
      <div className="fun-item-dot" />
      <div className="fun-item-body">
        <span className="fun-item-title">{title}</span>
        {sub && <span className="fun-item-sub">{sub}</span>}
      </div>
      {tag && <span className="fun-item-tag">{tag}</span>}
      <button className="fun-delete" title="Remove" onClick={() => onDelete(item.id)}>×</button>
    </div>
  )
}

function MealItem({ item, onDelete }) {
  const tags = [item.category, item.ingredient].filter(Boolean)
  return (
    <div className="fun-item">
      <div className="fun-item-dot" />
      <div className="fun-item-body">
        <span className="fun-item-title">{item.name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {tags.map(t => <span key={t} className="fun-item-tag">{t}</span>)}
        {item.link && (
          <a href={item.link} target="_blank" rel="noreferrer"
            style={{ fontSize: '0.7rem', color: 'var(--accent2)', textDecoration: 'none' }}>
            🔗 Recipe
          </a>
        )}
      </div>
      <button className="fun-delete" title="Remove" onClick={() => onDelete(item.id)}>×</button>
    </div>
  )
}

function FunList({ items, status, titleKey, subKey, isMeals, onDelete }) {
  if (status === 'loading') return <div className="fun-empty">Loading…</div>
  if (status === 'error')   return <div className="fun-empty">Unavailable</div>
  if (!items.length)        return <div className="fun-empty">Nothing here yet</div>

  return (
    <div className="fun-list">
      {isMeals
        ? items.map(item => <MealItem key={item.id} item={item} onDelete={onDelete} />)
        : items.map(item => <FunItem  key={item.id} item={item} titleKey={titleKey} subKey={subKey} onDelete={onDelete} />)
      }
    </div>
  )
}

// ── Add modal ─────────────────────────────────────────────
const FORM_CONFIG = {
  movies: {
    title:  '🎬 Add to Watch List:',
    fields: [
      { id: 'title',     placeholder: 'e.g. Inception' },
      { id: 'mediaType', placeholder: 'Movie or Show' },
    ],
  },
  books: {
    title:  '📚 Add to Reading List:',
    fields: [
      { id: 'title',  placeholder: 'e.g. Atomic Habits' },
      { id: 'author', placeholder: 'e.g. James Clear' },
    ],
  },
  mealideas: {
    title:  '🍽 Add a Meal Idea:',
    fields: [
      { id: 'name',       placeholder: 'e.g. Chicken Tikka Masala' },
      { id: 'category',   placeholder: 'e.g. Dinner, Quick' },
      { id: 'ingredient', placeholder: 'e.g. Chicken' },
      { id: 'link',       placeholder: 'https://…' },
    ],
  },
  weekendideas: {
    title:  '🏕 Add a Weekend Idea:',
    fields: [
      { id: 'title',       placeholder: 'e.g. Hiking at Mt. Rainier' },
      { id: 'description', placeholder: 'Notes (optional)' },
    ],
  },
  placestogo: {
    title:  '📍 Add a Place to Go:',
    fields: [
      { id: 'title',    placeholder: 'e.g. Pike Place Market' },
      { id: 'location', placeholder: 'City or address (optional)' },
    ],
  },
  localevents: {
    title:  '🎉 Add a Local Event:',
    fields: [
      { id: 'title', placeholder: 'e.g. Farmers Market' },
      { id: 'date',  placeholder: 'Date (optional)' },
    ],
  },
}

function AddModal({ type, onClose, onAdded }) {
  const cfg = FORM_CONFIG[type]
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (id, val) => setValues(v => ({ ...v, [id]: val }))

  async function handleSubmit() {
    if (!values[cfg.fields[0].id]?.trim()) return
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('action', 'add'); fd.append('type', type)
      cfg.fields.forEach(f => fd.append(f.id, values[f.id] || ''))
      if (type === 'movies' && !values.mediaType) fd.set('mediaType', 'Movie')
      await apiFetch(SCRIPTS.CHORES, { method: 'POST', body: fd })
      onAdded()
      onClose()
    } catch {
      setError('Failed to save — try again')
      setSaving(false)
    }
  }

  return (
    <div className="fun-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fun-overlay-box">
        <div className="fun-overlay-title">{cfg.title}</div>
        {cfg.fields.map(f => (
          <input
            key={f.id}
            className="fun-overlay-input"
            placeholder={f.placeholder}
            value={values[f.id] || ''}
            onChange={e => set(f.id, e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus={cfg.fields[0].id === f.id}
          />
        ))}
        {error && <div className="fun-overlay-status">{error}</div>}
        <div className="fun-overlay-actions">
          <button className="fun-overlay-btn cancel" onClick={onClose}>Cancel</button>
          <button className="fun-overlay-btn submit" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Read / Watch panel (col 1, full height) ───────────────
function ReadWatchPanel({ movies, books, status, onDelete, onAdd }) {
  const [tab, setTab] = useState('watch')
  const isWatch = tab === 'watch'

  return (
    <Panel>
      <PanelHeader
        title={<span style={{ color: 'var(--accent5)' }}>{isWatch ? 'Watch List' : 'Reading List'}</span>}
        actions={
          <button
            className="add-btn"
            style={{ background: 'var(--accent5)', color: '#0f1117' }}
            onClick={() => onAdd(isWatch ? 'movies' : 'books')}
          >+</button>
        }
      />
      <div className="fun-toggle">
        <button className={`fun-toggle-btn ${isWatch ? 'active' : ''}`} onClick={() => setTab('watch')}>
          🎬 Watch
        </button>
        <button className={`fun-toggle-btn ${!isWatch ? 'active' : ''}`} onClick={() => setTab('read')}>
          📚 Read
        </button>
      </div>
      {isWatch
        ? <FunList items={movies} status={status.movies} titleKey="title" subKey="mediaType" onDelete={id => onDelete('movies', id)} />
        : <FunList items={books}  status={status.books}  titleKey="title" subKey="author"    onDelete={id => onDelete('books',  id)} />
      }
    </Panel>
  )
}

// ── Simple generic panel ──────────────────────────────────
function SimplePanel({ title, color, type, items, status, onDelete, onAdd }) {
  return (
    <Panel>
      <PanelHeader
        title={<span style={{ color: color || 'var(--accent5)' }}>{title}</span>}
        actions={
          <button
            className="add-btn"
            style={{ background: color || 'var(--accent5)', color: '#0f1117' }}
            onClick={() => onAdd(type)}
          >+</button>
        }
      />
      <FunList items={items} status={status} titleKey="title" subKey={type === 'localevents' ? 'date' : 'location'} onDelete={id => onDelete(type, id)} />
    </Panel>
  )
}

// ── Main page ─────────────────────────────────────────────
const ALL_TYPES = ['movies', 'books', 'mealideas', 'weekendideas', 'placestogo', 'localevents']
const TYPE_TO_KEY = { mealideas: 'meals', weekendideas: 'weekendideas', placestogo: 'placestogo', localevents: 'localevents' }

function typeKey(type) { return TYPE_TO_KEY[type] || type }

export default function Fun() {
  const [data, setData] = useState({
    movies: [], books: [], meals: [], weekendideas: [], placestogo: [], localevents: []
  })
  const [status, setStatus] = useState({
    movies: 'loading', books: 'loading', meals: 'loading',
    weekendideas: 'loading', placestogo: 'loading', localevents: 'loading'
  })
  const [modal, setModal] = useState(null)

  const load = useCallback(async (type) => {
    const key = typeKey(type)
    setStatus(s => ({ ...s, [key]: 'loading' }))
    try {
      const res   = await apiFetch(SCRIPTS.CHORES + `?type=${type}`)
      const items = await res.json()
      setData(d => ({ ...d, [key]: items || [] }))
      setStatus(s => ({ ...s, [key]: 'ok' }))
    } catch {
      setStatus(s => ({ ...s, [key]: 'error' }))
    }
  }, [])

  useEffect(() => {
    ALL_TYPES.forEach(t => load(t))
  }, [load])

  async function handleDelete(type, id) {
    try {
      const fd = new FormData()
      fd.append('action', 'delete'); fd.append('type', type); fd.append('idx', id)
      await apiFetch(SCRIPTS.CHORES, { method: 'POST', body: fd })
      load(type)
    } catch { /* silent */ }
  }

  return (
    <div className="fun-content">

      {/* Col 1 — Read / Watch (spans both rows) */}
      <div className="fun-col1">
        <ReadWatchPanel
          movies={data.movies}
          books={data.books}
          status={status}
          onDelete={handleDelete}
          onAdd={setModal}
        />
      </div>

      {/* Col 2 row 1 — Weekend Ideas */}
      <div className="fun-col2-row1">
        <SimplePanel
          title="Weekend Ideas" color="var(--accent3)" type="weekendideas"
          items={data.weekendideas} status={status.weekendideas}
          onDelete={handleDelete} onAdd={setModal}
        />
      </div>

      {/* Col 2 row 2 — Places to Go */}
      <div className="fun-col2-row2">
        <SimplePanel
          title="Places to Go" color="var(--accent2)" type="placestogo"
          items={data.placestogo} status={status.placestogo}
          onDelete={handleDelete} onAdd={setModal}
        />
      </div>

      {/* Col 3 row 1 — Meal Ideas */}
      <div className="fun-col3-row1">
        <Panel>
          <PanelHeader
            title={<span style={{ color: 'var(--accent5)' }}>Meal Ideas</span>}
            actions={
              <button className="add-btn" style={{ background: 'var(--accent5)', color: '#0f1117' }}
                onClick={() => setModal('mealideas')}>+ Add</button>
            }
          />
          <FunList items={data.meals} status={status.meals} isMeals onDelete={id => handleDelete('mealideas', id)} />
        </Panel>
      </div>

      {/* Col 3 row 2 — Local Events */}
      <div className="fun-col3-row2">
        <SimplePanel
          title="Local Events" color="var(--accent4)" type="localevents"
          items={data.localevents} status={status.localevents}
          onDelete={handleDelete} onAdd={setModal}
        />
      </div>

      {modal && (
        <AddModal
          type={modal}
          onClose={() => setModal(null)}
          onAdded={() => load(modal)}
        />
      )}
    </div>
  )
}
