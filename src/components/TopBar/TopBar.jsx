import { useClock }   from '../../hooks/useClock'
import { useWeather } from '../../hooks/useWeather'
import './TopBar.css'

export default function TopBar({ title }) {
  const { clock, date }      = useClock()
  const { days, loading }    = useWeather()

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>

      <div className="clock-block">
        <div className="clock">{clock}</div>
        <div className="clock-date">{date}</div>
      </div>

      <div className="weather-block">
        {loading ? (
          <span className="weather-loading">Loading...</span>
        ) : days.length === 0 ? (
          <span className="weather-loading">Weather unavailable</span>
        ) : (
          days.map((d, i) => (
            <div className="weather-day" key={i}>
              <div className="day-name">{d.name}</div>
              <div className="weather-icon">{d.icon}</div>
              <div className="temp">{d.temp}</div>
              <div className="condition">{d.condition}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
