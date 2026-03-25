import { useState, useEffect } from 'react'
import { apiFetch, WEATHER_CONFIG } from '../api/scripts'

const WEATHER_ICONS = {
  0:'☀️',  1:'🌤️',  2:'⛅',  3:'☁️',
  45:'🌫️', 48:'🌫️',
  51:'🌦️', 53:'🌦️', 55:'🌧️',
  61:'🌧️', 63:'🌧️', 65:'🌧️',
  71:'🌨️', 73:'🌨️', 75:'❄️',
  80:'🌦️', 81:'🌧️', 82:'🌧️',
  95:'⛈️', 99:'⛈️',
}

const WEATHER_CONDITIONS = {
  0:'Clear',        1:'Mostly Clear', 2:'Partly Cloudy', 3:'Overcast',
  45:'Foggy',       48:'Foggy',
  51:'Lt Drizzle',  53:'Drizzle',     55:'Hvy Drizzle',
  61:'Lt Rain',     63:'Rain',        65:'Hvy Rain',
  71:'Lt Snow',     73:'Snow',        75:'Hvy Snow',
  80:'Showers',     81:'Showers',     82:'Hvy Showers',
  95:'Thunderstorm',99:'Hvy Storm',
}

const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export function useWeather() {
  const [days, setDays]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { lat, lon, timezone } = WEATHER_CONFIG
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=${encodeURIComponent(timezone)}&forecast_days=5`
        const res  = await apiFetch(url)
        const data = await res.json()
        const isMobile = window.innerWidth <= 768
        const count = isMobile ? 3 : 5

        const parsed = data.daily.time.slice(0, count).map((t, i) => {
          const d    = new Date(t + 'T12:00:00')
          const code = data.daily.weathercode[i]
          return {
            name:      i === 0 ? 'Today' : DAY_LABELS[d.getDay()],
            icon:      WEATHER_ICONS[code]      ?? '🌡️',
            temp:      `${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°`,
            condition: WEATHER_CONDITIONS[code] ?? 'Mixed',
          }
        })
        setDays(parsed)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { days, loading, error }
}
