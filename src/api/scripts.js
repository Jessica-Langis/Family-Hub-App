// ── Google Apps Script endpoints ──
export const SCRIPTS = {
  GROCERY: 'https://script.google.com/macros/s/AKfycbxjEdIYe_vM3AEK2qvqZAfGwkfWC_XnAlsJV4kLyyl217xDhoTJjr2hpsizqj6AW4WiZg/exec',
  CHORES:  'https://script.google.com/macros/s/AKfycbxWTpChkrWj-CYqBq4zt-ukj-FpSz2bttXklwHbBwNS0yv7p2hc5eNzQaNbHCF-vCXc/exec',
  MEAL:    'https://script.google.com/macros/s/AKfycbzg4BtoC8K9zbNx4zVN5wM7Z68K63t41IZUGbf8Z9kKZrqnij4C3XIcjAWD9LmSTos4ng/exec',
  TORI:    'https://script.google.com/macros/s/AKfycbyGeDAu5PkLoEOkvWpzeUyNWTpkiYsHPu49WneYlcQMQfq_0n1UO0AoqvLQ39r2p4WFIg/exec',
  NOVA:    'https://script.google.com/macros/s/AKfycbx2XMPpCWLv6J3WKLjh1ALsH7yYZ9eKLbd1eoMj0hR6dlQLVVxJ2eHdNADLE8of4gmf/exec',
}

// ── Google Calendar ──
export const CALENDAR = {
  FAMILY_EMBED: 'https://calendar.google.com/calendar/embed?src=family12041959028375865807%40group.calendar.google.com&ctz=America%2FLos_Angeles&mode=AGENDA&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0&bgcolor=%23181c27&color=%23E67C73',
  FAMILY_ICS:   'https://calendar.google.com/calendar/ical/family12041959028375865807%40group.calendar.google.com/private-981312a323ea475c7a6b4c974d63fb09/basic.ics',
}

// ── Weather config (Open-Meteo, no key required) ──
export const WEATHER_CONFIG = {
  lat: 47.5221,
  lon: -120.4699,
  timezone: 'America/Los_Angeles',
}

// ── Shared fetch wrapper ──
export async function apiFetch(url, options = {}) {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`)
  return res
}
