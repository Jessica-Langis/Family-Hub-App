import { useState, useEffect } from 'react'
import Panel, { PanelHeader } from '../../../components/Panel/Panel'
import { SCRIPTS, apiFetch } from '../../../api/scripts'

const BULLETIN_FONTS = ['dancing','caveat','pacifico','satisfy','kalam','patrick']
function bulletinFont(row) {
  return BULLETIN_FONTS[Math.abs(row || 0) % BULLETIN_FONTS.length]
}

const NOTE_COLORS = ['amber','rose','teal','blue','lavender']

function BulletinNote({ item, isDinner, onDelete }) {
  const color = isDinner ? 'teal' : (item.color || 'amber')
  const font  = isDinner ? 'dancing' : bulletinFont(item.row)

  let dateStr = ''
  if (item.date) {
    const d = new Date(item.date)
    if (!isNaN(d.getTime())) {
      dateStr = `${d.getMonth()+1}/${d.getDate()}`
    }
  }

  return (
    <div className="bulletin-item" data-color={color} data-font={font}>
      {!isDinner && onDelete && (
        <button className="bulletin-delete" onClick={() => onDelete(item.row)}>×</button>
      )}
      <div className="bulletin-inner">
        <div className={`bulletin-who${isDinner ? ' bulletin-dinner-who' : ''}`}>
          {isDinner ? "Tonight's Dinner" : (item.who || 'Someone')}
        </div>
        <div className={`bulletin-text${isDinner && !item.text ? ' empty-dinner' : ''}`}>
          {isDinner ? (item.text || 'Nothing planned yet') : (item.text || '')}
        </div>
        {dateStr && <div className="bulletin-date">{dateStr}</div>}
      </div>
    </div>
  )
}

function AddNoteModal({ onClose, onAdded }) {
  const [who,     setWho]     = useState('')
  const [text,    setText]    = useState('')
  const [color,   setColor]   = useState('amber')
  const [saving,  setSaving]  = useState(false)

  async function submit() {
    if (!text.trim()) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('type', 'bulletin'); fd.append('action', 'add')
      fd.append('who', who.trim() || 'Someone')
      fd.append('text', text.trim())
      fd.append('color', color)
      fd.append('date', new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      await apiFetch(SCRIPTS.CHORES, { method: 'POST', body: fd })
      onAdded(); onClose()
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="fun-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fun-overlay-box">
        <div className="fun-overlay-title">📌 Post to Bulletin</div>
        <input className="fun-overlay-input" placeholder="Who? (e.g. Mom)" value={who} onChange={e => setWho(e.target.value)} />
        <textarea
          className="fun-overlay-input"
          placeholder="What's the note?"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          autoFocus
          style={{ resize: 'none' }}
        />
        <div style={{ display: 'flex', gap: 8, padding: '2px 0' }}>
          {NOTE_COLORS.map(c => (
            <button
              key={c}
              title={c}
              className={`note-color-swatch${color === c ? ' selected' : ''}`}
              data-color={c}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div className="fun-overlay-actions">
          <button className="fun-overlay-btn cancel" onClick={onClose}>Cancel</button>
          <button className="fun-overlay-btn submit" onClick={submit} disabled={saving}>
            {saving ? '…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BulletinPanel() {
  const [bulletins, setBulletins] = useState([])
  const [dinner,    setDinner]    = useState(null)
  const [showAdd,   setShowAdd]   = useState(false)

  async function load() {
    try {
      const [bRes, mRes] = await Promise.all([
        apiFetch(SCRIPTS.CHORES + '?type=bulletin'),
        apiFetch(SCRIPTS.MEAL),
      ])
      const items = await bRes.json()
      const meals = await mRes.json()
      setBulletins(Array.isArray(items) ? items : [])
      const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      setDinner(meals[dayNames[new Date().getDay()]] || null)
    } catch { /* silent */ }
  }

  useEffect(() => { load() }, [])

  async function deleteNote(id) {
    try {
      const fd = new FormData()
      fd.append('type', 'bulletin'); fd.append('action', 'delete'); fd.append('id', id)
      await apiFetch(SCRIPTS.CHORES, { method: 'POST', body: fd })
      load()
    } catch { /* silent */ }
  }

  return (
    <Panel className="hg-bulletin" style={{ overflow: 'hidden' }}>
      <PanelHeader
        title="Bulletin Board"
        actions={
          <button className="add-btn" onClick={() => setShowAdd(true)}>+ Post</button>
        }
      />
      <div className="home-bulletin-strip corkboard-body">
        {/* Tonight's dinner always first */}
        <BulletinNote item={{ text: dinner }} isDinner />
        {bulletins.slice(0, 4).map((b, i) => (
          <BulletinNote key={i} item={b} onDelete={deleteNote} />
        ))}
        {bulletins.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: '0.82rem', padding: '4px 0' }}>
            Nothing posted yet — be the first!
          </div>
        )}
      </div>
      {showAdd && (
        <AddNoteModal onClose={() => setShowAdd(false)} onAdded={load} />
      )}
    </Panel>
  )
}
