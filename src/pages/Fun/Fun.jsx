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
    title:  '🎬 We Need to Watch:',
    fields: [
      { id: 'title',     placeholder: 'e.g. Inception' },
      { id: 'mediaType', placeholder: 'Movie or Show' },
    ],
  },
  books: {
    title:  '📚 Books to Check Out:',
    fields: [
      { id: 'title',  placeholder: 'e.g. Atomic Habits' },
      { id: 'author', placeholder: 'e.g. James Clear' },
    ],
  },
  mealideas: {
    title:  '🍽 I Want to Cook Something Fun:',
    fields: [
      { id: 'name',       placeholder: 'e.g. Chicken Tikka Masala' },
      { id: 'category',   placeholder: 'e.g. Dinner, Quick' },
      { id: 'ingredient', placeholder: 'e.g. Chicken' },
      { id: 'link',       placeholder: 'https://…' },
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

// ── Main page ─────────────────────────────────────────────
export default function Fun() {
  const [movies, setMovies] = useState([])
  const [books,  setBooks]  = useState([])
  const [meals,  setMeals]  = useState([])
  const [status, setStatus] = useState({ movies: 'loading', books: 'loading', meals: 'loading' })
  const [modal,  setModal]  = useState(null)

  const load = useCallback(async (type) => {
    const key = type === 'mealideas' ? 'meals' : type
    setStatus(s => ({ ...s, [key]: 'loading' }))
    try {
      const res   = await apiFetch(SCRIPTS.CHORES + `?type=${type}`)
      const items = await res.json()
      if (type === 'movies')    setMovies(items || [])
      if (type === 'books')     setBooks(items  || [])
      if (type === 'mealideas') setMeals(items  || [])
      setStatus(s => ({ ...s, [key]: 'ok' }))
    } catch {
      setStatus(s => ({ ...s, [key]: 'error' }))
    }
  }, [])

  useEffect(() => {
    load('movies'); load('books'); load('mealideas')
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
      <Panel>
        <PanelHeader
          title={<span style={{ color: 'var(--accent5)' }}>Movies &amp; Shows</span>}
          actions={
            <button className="add-btn" style={{ background: 'var(--accent5)', color: '#0f1117' }}
              onClick={() => setModal('movies')}>+</button>
          }
        />
        <FunList items={movies} status={status.movies} titleKey="title" onDelete={id => handleDelete('movies', id)} />
      </Panel>

      <Panel>
        <PanelHeader
          title={<span style={{ color: 'var(--accent5)' }}>Books to Read</span>}
          actions={
            <button className="add-btn" style={{ background: 'var(--accent5)', color: '#0f1117' }}
              onClick={() => setModal('books')}>+ Add</button>
          }
        />
        <FunList items={books} status={status.books} titleKey="title" subKey="author" onDelete={id => handleDelete('books', id)} />
      </Panel>

      <Panel>
        <PanelHeader
          title={<span style={{ color: 'var(--accent5)' }}>Meal Ideas</span>}
          actions={
            <button className="add-btn" style={{ background: 'var(--accent5)', color: '#0f1117' }}
              onClick={() => setModal('mealideas')}>+ Add</button>
          }
        />
        <FunList items={meals} status={status.meals} isMeals onDelete={id => handleDelete('mealideas', id)} />
      </Panel>

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
