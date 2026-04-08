import { useState, useEffect } from 'react'
import { WEATHER_CONFIG } from '../api/scripts'

const NWS_HEADERS = { 'User-Agent': 'FamilyHubApp (family-hub)' }
const DAY_LABELS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function nwsToIcon(shortForecast) {
  if (!shortForecast) return '🌡️'
  const f = shortForecast.toLowerCase()
  if (f.includes('thunderstorm') || f.includes('thunder'))              return '⛈️'
  if (f.includes('blizzard')     || f.includes('heavy snow'))           return '❄️'
  if (f.includes('snow shower')  || f.includes('snow and'))             return '🌨️'
  if (f.includes('snow'))                                                return '🌨️'
  if (f.includes('freezing')     || f.includes('sleet') || f.includes('wintry')) return '🌧️'
  if (f.includes('heavy rain')   || f.includes('rain shower'))          return '🌧️'
  if (f.includes('showers')      || f.includes('rain'))                 return '🌧️'
  if (f.includes('drizzle'))                                             return '🌦️'
  if (f.includes('fog')          || f.includes('haze') || f.includes('smoke')) return '🌫️'
  if (f.includes('windy')        || f.includes('breezy'))               return '💨'
  if (f.includes('mostly cloudy') || f.includes('partly cloudy'))       return '⛅'
  if (f.includes('overcast')     || f.includes('cloudy'))               return '☁️'
  if (f.includes('mostly sunny') || f.includes('partly sunny'))         return '🌤️'
  if (f.includes('sunny')        || f.includes('clear'))                return '☀️'
  return '🌡️'
}

export function useWeather() {
  const [days,    setDays]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { lat, lon } = WEATHER_CONFIG

        // Step 1 — resolve the NWS grid for this lat/lon
        const pointsRes  = await fetch(
          `https://api.weather.gov/points/${lat},${lon}`,
          { headers: NWS_HEADERS }
        )
        if (!pointsRes.ok) throw new Error(`NWS points ${pointsRes.status}`)
        const pointsData = await pointsRes.json()
        const forecastUrl = pointsData.properties?.forecast
        if (!forecastUrl) throw new Error('No forecast URL from NWS')

        // Step 2 — fetch the daily forecast periods
        const fxRes  = await fetch(forecastUrl, { headers: NWS_HEADERS })
        if (!fxRes.ok) throw new Error(`NWS forecast ${fxRes.status}`)
        const fxData = await fxRes.json()
        const periods = fxData.properties?.periods
        if (!periods?.length) throw new Error('No forecast periods')

        // Build date → { high, low, icon, condition } from periods
        // NWS splits into daytime (high) and nighttime (low) half-day periods
        const byDate = new Map()
        for (const p of periods) {
          const dateStr = p.startTime.slice(0, 10)
          if (!byDate.has(dateStr)) byDate.set(dateStr, {})
          const entry = byDate.get(dateStr)
          if (p.isDaytime) {
            entry.high      = p.temperature
            entry.icon      = nwsToIcon(p.shortForecast)
            entry.condition = p.shortForecast
          } else {
            entry.low = p.temperature
            // If today's first period is overnight (afternoon already passed),
            // use night period for icon fallback
            if (entry.icon == null) {
              entry.icon      = nwsToIcon(p.shortForecast)
              entry.condition = p.shortForecast
            }
          }
        }

        const isMobile = window.innerWidth <= 768
        const count    = isMobile ? 3 : 5
        const today    = new Date(); today.setHours(0, 0, 0, 0)

        const result = []
        for (let i = 0; result.length < count && i < 8; i++) {
          const d       = new Date(today)
          d.setDate(d.getDate() + i)
          const dateStr = d.toISOString().slice(0, 10)
          const entry   = byDate.get(dateStr)
          if (!entry) continue

          const hi   = entry.high != null ? `${entry.high}°` : '—'
          const lo   = entry.low  != null ? `${entry.low}°`  : '—'
          const temp = `${hi} / ${lo}`

          result.push({
            name:      i === 0 ? 'Today' : DAY_LABELS[d.getDay()],
            icon:      entry.icon      ?? '🌡️',
            temp,
            condition: entry.condition ?? '',
          })
        }

        setDays(result)
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
