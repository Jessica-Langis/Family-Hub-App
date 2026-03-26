import { useState, useEffect } from 'react'
import Panel, { PanelHeader } from '../../../components/Panel/Panel'
import { SCRIPTS, apiFetch } from '../../../api/scripts'

function AddModal({ onClose, onAdded }) {
  const today = new Date().toISOString().slice(0,10)
  const [name,  setName]  = useState('')
  const [loc,   setLoc]   = useState('')
  const [date,  setDate]  = useState(today)
  const [time,  setTime]  = useState('')
  const [err,   setErr]   = useState('')
  const [saving,setSaving]= useState(false)

  async function submit() {
    if (!name.trim() || !loc.trim()) { setErr('Name and location are required.'); return }
    setSaving(true); setErr('')
    try {
      const fd = new FormData()
      fd.append('action', 'add'); fd.append('type', 'whereami')
      fd.append('name', name.trim()); fd.append('location', loc.trim())
      fd.append('date', date || ''); fd.append('time', time.trim())
      await apiFetch(SCRIPTS.CHORES, { method: 'POST', body: fd })
      onAdded(); onClose()
    } catch {
      setErr('Failed to save — try again')
      setSaving(false)
    }
  }

  return (
    <div className="fun-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fun-overlay-box">
        <div className="fun-overlay-title">📍 Where Am I?</div>
        <input className="fun-overlay-input" placeholder="Who? (e.g. Jessica)" value={name} onChange={e => setName(e.target.value)} autoFocus />
        <input className="fun-overlay-input" placeholder="Where? (e.g. Office, Gym)" value={loc} onChange={e => setLoc(e.target.value)} />
        <input className="fun-overlay-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input className="fun-overlay-input" placeholder="Time (optional, e.g. Back by 6pm)" value={time} onChange={e => setTime(e.target.value)} />
        {err && <div className="fun-overlay-status" style={{ color: 'var(--accent3)' }}>{err}</div>}
        <div className="fun-overlay-actions">
          <button className="fun-overlay-btn cancel" onClick={onClose}>Cancel</button>
          <button className="fun-overlay-btn submit" onClick={submit} disabled={saving}>
            {saving ? '…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WhereAmIPanel() {
  const [items,   setItems]   = useState([])
  const [status,  setStatus]  = useState('loading')
  const [showAdd, setShowAdd] = useState(false)

  async function load() {
    setStatus('loading')
    try {
      const res   = await apiFetch(SCRIPTS.CHORES + '?type=whereami')
      const data  = await res.json()
      const todayStr = new Date().toISOString().slice(0,10)
      const active = Array.isArray(data)
        ? data.filter(item => !item.date || item.date >= todayStr)
        : []
      setItems(active)
      setStatus('ok')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => { load() }, [])

  async function deleteItem(id) {
    try {
      const fd = new FormData()
      fd.append('action', 'delete'); fd.append('type', 'whereami'); fd.append('idx', id)
      await apiFetch(SCRIPTS.CHORES, { method: 'POST', body: fd })
      load()
    } catch { /* silent */ }
  }

  return (
    <Panel className="hg-whereami">
      <PanelHeader
        title="📍 Where I'll Be:"
        actions={
          <button className="add-btn" onClick={() => setShowAdd(true)}>+</button>
        }
      />
      <div className="whereami-list">
        {status === 'loading' && <div className="whereami-empty">Loading…</div>}
        {status === 'error'   && <div className="whereami-empty">Unavailable</div>}
        {status === 'ok' && items.length === 0 && <div className="whereami-empty">No one checked in yet</div>}
        {status === 'ok' && items.map(item => {
          const meta = [item.date, item.time].filter(Boolean).join(' · ')
          return (
            <div key={item.id} className="whereami-item">
              <div className="whereami-dot" />
              <div className="whereami-info">
                <div className="whereami-name">{item.name}</div>
                <div className="whereami-loc">{item.location}</div>
                {meta && <div className="whereami-meta">{meta}</div>}
              </div>
              <button className="whereami-delete" onClick={() => deleteItem(item.id)} title="Remove">×</button>
            </div>
          )
        })}
      </div>
      {showAdd && (
        <AddModal onClose={() => setShowAdd(false)} onAdded={load} />
      )}
    </Panel>
  )
}
