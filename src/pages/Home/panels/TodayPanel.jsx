import { useState, useEffect } from 'react'
import Panel from '../../../components/Panel/Panel'
import { SCRIPTS, apiFetch } from '../../../api/scripts'
import { normalizeDate } from '../homeUtils'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function buildColumn(date, choreItems) {
  const today = new Date(); today.setHours(0,0,0,0)
  const dueChores = choreItems.filter(c => {
    if (!c.dueDate) return false
    const d = normalizeDate(c.dueDate)
    return d && d.getTime() === date.getTime()
  })
  return dueChores
}

function DateColumn({ date, chores, label }) {
  const dayName = DAYS[date.getDay()]
  const dateLabel = `${dayName}, ${MONTHS[date.getMonth()]} ${date.getDate()}`

  return (
    <div className="today-col">
      <div className="today-col-header">
        <span className="today-col-title">{label}</span>
        <span className="today-date">{dateLabel}</span>
      </div>
      <div className="today-col-body">
        {chores.length === 0
          ? <span className="today-clear">✨ All clear</span>
          : (
            <div className="today-subcols">
              <div className="today-subcol">
                <div className="today-section-label">To Do</div>
                {chores.map((c, i) => (
                  <div key={i} className="today-item chore">
                    <div className="today-item-dot" />
                    <span className="today-item-text">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default function TodayPanel() {
  const [chores, setChores] = useState([])

  useEffect(() => {
    apiFetch(SCRIPTS.CHORES + '?type=chores')
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data
          : (data?.result || data?.items || data?.data || [])
        setChores(items)
      })
      .catch(() => {})
  }, [])

  const today    = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)

  return (
    <Panel className="hg-today">
      <div className="today-columns">
        <DateColumn date={today}    chores={buildColumn(today,    chores)} label="Today" />
        <div className="today-divider" />
        <DateColumn date={tomorrow} chores={buildColumn(tomorrow, chores)} label="Tomorrow" />
      </div>
    </Panel>
  )
}
