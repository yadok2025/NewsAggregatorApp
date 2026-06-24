import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const COUNTRY_COORDS = {
  AD: [42.5, 1.6],   AE: [23.4, 53.8],   AF: [33.9, 67.7],   AG: [17.1, -61.8],
  AL: [41.2, 20.2],   AM: [40.1, 44.5],   AO: [-11.2, 17.9],   AR: [-38.4, -63.6],
  AT: [47.5, 14.1],   AU: [-25.3, 133.8],   AZ: [40.1, 47.6],   BA: [43.9, 17.7],
  BB: [13.2, -59.5],   BD: [23.7, 90.4],   BE: [50.5, 4.5],   BF: [12.2, -1.6],
  BG: [42.7, 25.5],   BH: [26.1, 50.6],   BI: [-3.4, 29.9],   BJ: [9.3, 2.3],
  BN: [4.5, 114.7],   BO: [-16.2, -63.6],   BR: [-14.2, -51.9],   BS: [25.0, -77.4],
  BT: [27.5, 90.5],   BW: [-22.3, 24.7],   BY: [53.7, 27.9],   BZ: [17.2, -88.5],
  CA: [56.1, -106.3],   CD: [-4.0, 21.8],   CF: [6.6, 20.9],   CG: [-0.2, 15.8],
  CH: [46.8, 8.2],   CI: [7.5, -5.5],   CL: [-35.7, -71.5],   CM: [7.4, 12.3],
  CN: [35.9, 104.2],   CO: [4.6, -74.3],   CR: [9.7, -83.7],   CU: [21.8, -80.0],
  CV: [16.0, -24.0],   CY: [35.1, 33.4],   CZ: [49.8, 15.5],   DE: [51.2, 10.4],
  DJ: [11.8, 42.6],   DK: [56.3, 9.5],   DM: [15.4, -61.4],   DO: [18.7, -70.2],
  DZ: [28.0, 1.7],   EC: [-1.8, -78.2],   EE: [58.6, 25.0],   EG: [26.8, 30.8],
  ER: [15.2, 39.7],   ES: [40.6, -3.7],   ET: [9.1, 40.5],   FI: [61.9, 25.7],
  FJ: [-16.6, 179.4],   FK: [-51.7, -59.5],   FM: [6.9, 158.2],   FO: [62.0, -7.0],
  FR: [46.2, 2.2],   GA: [-0.8, 11.6],   GB: [55.4, -3.4],   GD: [12.1, -61.7],
  GE: [42.3, 43.3],   GF: [4.0, -53.0],   GH: [7.9, -1.0],   GI: [36.1, -5.3],
  GL: [64.2, -51.7],   GM: [13.4, -15.3],   GN: [9.9, -9.7],   GP: [16.3, -61.5],
  GQ: [1.7, 10.3],   GR: [39.1, 21.8],   GT: [15.7, -90.2],   GW: [11.8, -15.2],
  GY: [4.9, -58.9],   HN: [15.2, -86.2],   HR: [45.1, 15.2],   HT: [18.9, -72.3],
  HU: [47.2, 19.5],   ID: [-0.8, 113.9],   IE: [53.4, -8.2],   IL: [31.1, 34.8],
  IN: [20.6, 79.0],   IQ: [33.2, 43.7],   IR: [32.4, 53.7],   IS: [64.9, -19.0],
  IT: [41.9, 12.6],   JM: [18.1, -77.3],   JO: [30.6, 36.2],   JP: [36.2, 138.3],
  KE: [-0.0, 37.9],   KG: [41.2, 74.8],   KH: [12.6, 104.9],   KI: [1.4, 173.0],
  KM: [-11.6, 43.3],   KP: [40.3, 127.5],   KR: [35.9, 127.8],   KW: [29.3, 47.5],
  KY: [19.3, -81.2],   KZ: [48.0, 66.9],   LA: [19.9, 102.5],   LB: [33.9, 35.5],
  LC: [13.9, -61.0],   LK: [7.9, 80.8],   LR: [6.4, -9.4],   LS: [-29.6, 28.2],
  LT: [55.2, 23.9],   LU: [49.8, 6.1],   LV: [56.9, 24.1],   LY: [26.3, 17.2],
  MA: [31.8, -7.1],   MD: [47.4, 28.3],   ME: [42.7, 19.3],   MG: [-18.8, 46.9],
  MK: [41.5, 21.7],   ML: [17.5, -4.0],   MM: [21.9, 95.9],   MN: [46.9, 103.8],
  MO: [22.2, 113.5],   MQ: [14.6, -61.0],   MR: [21.0, -10.9],   MT: [35.9, 14.4],
  MU: [-20.3, 57.5],   MV: [3.2, 73.2],   MW: [-13.3, 34.3],   MX: [23.6, -102.6],
  MY: [4.2, 101.9],   MZ: [-18.7, 35.5],   NA: [-22.9, 18.5],   NC: [-20.9, 165.6],
  NE: [17.6, 8.1],   NG: [9.1, 8.7],   NI: [12.9, -85.2],   NL: [52.3, 5.3],
  NO: [60.5, 8.4],   NP: [28.3, 84.1],   NR: [-0.5, 166.9],   NZ: [-40.9, 174.9],
  OM: [21.5, 55.9],   PA: [8.5, -80.8],   PE: [-9.1, -75.0],   PF: [-17.7, -149.4],
  PG: [-6.3, 143.9],   PH: [12.9, 121.8],   PK: [30.4, 69.3],   PL: [51.9, 19.1],
  PM: [46.9, -56.3],   PR: [18.2, -66.6],   PS: [31.9, 35.2],   PT: [39.4, -8.2],
  PW: [7.5, 134.5],   PY: [-23.4, -58.4],   QA: [25.3, 51.2],   RE: [-21.1, 55.5],
  RO: [45.9, 24.9],   RS: [44.0, 21.0],   RU: [61.5, 105.3],   RW: [-1.9, 29.9],
  SA: [23.9, 45.1],   SB: [-9.6, 160.2],   SC: [-4.7, 55.5],   SD: [12.9, 30.2],
  SE: [60.1, 18.6],   SG: [1.4, 103.8],   SH: [-15.9, -5.7],   SI: [46.1, 14.8],
  SK: [48.7, 19.7],   SL: [8.4, -11.8],   SM: [43.9, 12.5],   SN: [14.5, -14.4],
  SO: [5.1, 46.2],   SR: [3.9, -56.0],   SS: [6.9, 31.3],   ST: [0.2, 6.6],
  SV: [13.7, -88.9],   SY: [34.8, 38.9],   SZ: [-26.5, 31.5],   TC: [21.7, -71.6],
  TD: [15.5, 18.7],   TG: [8.6, 0.8],   TH: [15.9, 100.9],   TJ: [38.8, 71.2],
  TL: [-8.9, 125.8],   TM: [38.9, 59.5],   TN: [33.9, 9.5],   TO: [-21.2, -175.2],
  TR: [38.9, 35.2],   TT: [10.7, -61.5],   TV: [-7.5, 178.1],   TW: [23.7, 120.9],
  TZ: [-6.4, 34.8],   UA: [48.4, 31.1],   UG: [1.3, 32.3],   US: [39.8, -98.6],
  UY: [-32.5, -55.8],   UZ: [41.4, 64.6],   VA: [41.9, 12.5],   VC: [13.3, -61.2],
  VE: [6.4, -66.6],   VI: [18.3, -64.9],   VN: [14.1, 108.3],   VU: [-15.4, 166.9],
  WF: [-14.3, -178.1],   WS: [-13.6, -172.3],   YE: [15.5, 48.5],   ZA: [-30.6, 22.9],
  ZM: [-13.1, 28.8],   ZW: [-19.0, 29.1],
}

const TECH_HUBS = {
  'san francisco': [37.77, -122.42], 'new york': [40.71, -74.01],
  'seattle': [47.61, -122.33], 'london': [51.51, -0.13],
  'berlin': [52.52, 13.41], 'tokyo': [35.68, 139.69],
  'beijing': [39.90, 116.40], 'shanghai': [31.23, 121.47],
  'bangalore': [12.97, 77.59], 'singapore': [1.35, 103.82],
  'tel aviv': [32.09, 34.78], 'toronto': [43.65, -79.38],
  'paris': [48.86, 2.35], 'amsterdam': [52.37, 4.90],
  'stockholm': [59.33, 18.07], 'austin': [30.27, -97.74],
  'boston': [42.36, -71.06], 'mumbai': [19.08, 72.88],
  'seoul': [37.57, 126.98], 'sydney': [-37.81, 144.96],
  'shenzhen': [22.54, 114.06], 'hangzhou': [30.27, 120.15],
  'dubai': [25.20, 55.27], 'riyadh': [24.71, 46.68],
  'istanbul': [41.01, 28.98], 'moscow': [55.76, 37.62],
  'kyiv': [50.45, 30.52], 'warsaw': [52.23, 21.01],
  'prague': [50.08, 14.44], 'budapest': [47.50, 19.04],
  'vienna': [48.21, 16.37], 'zurich': [47.37, 8.54],
  'munich': [48.14, 11.58], 'hamburg': [53.55, 9.99],
  'frankfurt': [50.11, 8.68], 'copenhagen': [55.68, 12.57],
  'oslo': [59.91, 10.75], 'helsinki': [60.17, 24.94],
  'dublin': [53.35, -6.26], 'lisbon': [38.72, -9.14],
  'barcelona': [41.39, 2.17], 'madrid': [40.42, -3.70],
  'rome': [41.90, 12.50], 'milan': [45.46, 9.19],
  'melbourne': [-37.81, 144.96], 'vancouver': [49.28, -123.12],
  'montreal': [45.50, -73.57], 'los angeles': [34.05, -118.24],
  'chicago': [41.88, -87.63], 'houston': [29.76, -95.37],
  'phoenix': [33.45, -112.07], 'san diego': [32.72, -117.16],
  'denver': [39.74, -104.99], 'portland': [45.52, -122.68],
  'miami': [25.76, -80.19], 'atlanta': [33.75, -84.39],
  'minneapolis': [44.98, -93.27], 'detroit': [42.33, -83.05],
  'kolkata': [22.57, 88.36], 'chennai': [13.08, 80.27],
  'hyderabad': [17.39, 78.49], 'pune': [18.52, 73.86],
  'ahmedabad': [23.02, 72.57], 'jakarta': [-6.21, 106.85],
  'bangkok': [13.76, 100.50], 'manila': [14.60, 120.98],
  'hong kong': [22.32, 114.17], 'chengdu': [30.57, 104.07],
  'wuhan': [30.59, 114.31], 'nairobi': [-1.29, 36.82],
  'lagos': [6.52, 3.38], 'cairo': [30.04, 31.24],
  'johannesburg': [-26.20, 28.04], 'cape town': [-33.93, 18.42],
  'accra': [5.60, -0.19], 'casablanca': [33.57, -7.59],
  'buenos aires': [-34.60, -58.38], 'santiago': [-33.45, -70.67],
  'bogota': [4.71, -74.07], 'lima': [-12.05, -77.04],
  'mexico city': [19.43, -99.13], 'rio de janeiro': [-22.91, -43.17],
  'sao paulo': [-23.55, -46.63], 'brasilia': [-15.79, -47.88],
  'montevideo': [-34.90, -56.16], 'quito': [-0.18, -78.47],
  'la paz': [-16.49, -68.12], 'asuncion': [-25.26, -57.58],
  'tegucigalpa': [14.07, -87.19], 'guatemala city': [14.63, -90.51],
  'san salvador': [13.69, -89.22], 'managua': [12.11, -86.24],
  'san jose': [9.93, -84.09], 'panama city': [8.98, -79.52],
  'havana': [23.11, -82.37], 'kingston': [18.00, -76.79],
  'santo domingo': [18.50, -69.90], 'port-au-prince': [18.59, -72.31],
  'baku': [40.41, 49.87], 'tbilisi': [41.72, 44.83],
  'yerevan': [40.18, 44.51], 'astana': [51.17, 71.44],
  'tashkent': [41.30, 69.28], 'bishkek': [42.87, 74.57],
  'dushanbe': [38.56, 68.77], 'ashgabat': [37.96, 58.33],
  'kabul': [34.53, 69.16], 'islamabad': [33.68, 73.05],
  'karachi': [24.86, 67.01], 'lahore': [31.55, 74.36],
  'dhaka': [23.81, 90.41], 'colombo': [6.93, 79.86],
  'kathmandu': [27.72, 85.32], 'yangon': [16.87, 96.19],
  'kuala lumpur': [3.14, 101.70], 'hanoi': [21.03, 105.85],
}

function getEventCoords(event, tab) {
  if (tab === 'world') {
    const countries = event.countries || []
    if (countries.length > 0) {
      const code = countries[0].toUpperCase()
      if (COUNTRY_COORDS[code]) return COUNTRY_COORDS[code]
    }
    return guessCoordsFromText(event.title || event.summary || '')
  }
  const text = `${event.title || ''} ${event.summary || ''} ${event.source || ''} ${event.keywords?.join(' ') || ''}`
  return guessCoordsFromText(text)
}

function guessCoordsFromText(text) {
  if (!text) return null
  const lower = text.toLowerCase()
  for (const [city, coords] of Object.entries(TECH_HUBS)) {
    if (lower.includes(city)) {
      return [coords[0] + (Math.random() - 0.5) * 0.5, coords[1] + (Math.random() - 0.5) * 0.5]
    }
  }
  const defaults = [[37.77, -122.42], [51.51, -0.13], [35.68, 139.69], [39.90, 116.40], [12.97, 77.59], [1.35, 103.82]]
  return defaults[Math.floor(Math.random() * defaults.length)]
}

function getEventColor(event, tab) {
  if (tab === 'world') {
    const topics = event.topics || []
    if (topics.includes('politics')) return '#ef4444'
    if (topics.includes('geopolitics')) return '#f97316'
    if (topics.includes('economy')) return '#10b981'
    if (topics.includes('technology')) return '#06b6d4'
    if (topics.includes('sports')) return '#8b5cf6'
    if (topics.includes('culture')) return '#14b8a6'
    return '#eab308'
  }
  const cat = (event.category || '').toLowerCase()
  if (cat.includes('ai') || cat.includes('ml')) return '#8b5cf6'
  if (cat.includes('security') || cat.includes('crypto')) return '#ef4444'
  if (cat.includes('hardware')) return '#f97316'
  if (cat.includes('software') || cat.includes('open source')) return '#10b981'
  return '#06b6d4'
}

function getEventRadius(event) {
  const importance = event.importance || 50
  return Math.max(6, Math.min(22, importance / 4.5))
}

function FlyToBounds({ events }) {
  const map = useMap()
  useEffect(() => {
    if (events.length > 0) {
      const bounds = events.map(e => e._coords).filter(Boolean)
      if (bounds.length > 0) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 5 })
    }
  }, [events, map])
  return null
}

export default function WorldMap({ snapshots, tab, onEditEvent }) {
  const [query, setQuery] = useState('')
  const [topicFilter, setTopicFilter] = useState('')
  const [minImportance, setMinImportance] = useState(0)
  const [dateRange, setDateRange] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState(null)

  const allEvents = useMemo(() => {
    const events = []
    snapshots.forEach(snapshot => {
      try {
        const parsed = JSON.parse(snapshot.events_json)
        const evts = parsed.events || parsed.topics || []
        evts.forEach(ev => {
          const coords = getEventCoords(ev, tab)
          if (coords) {
            events.push({ ...ev, _snapshotId: snapshot.id, _coords: coords, _tab: tab })
          }
        })
      } catch {}
    })
    return events
  }, [snapshots, tab])

  const allTopics = useMemo(() => {
    const topics = new Set()
    allEvents.forEach(ev => {
      if (ev.topics) ev.topics.forEach(t => topics.add(t))
      if (ev.category) topics.add(ev.category)
    })
    return Array.from(topics).sort()
  }, [allEvents])

  const filteredEvents = useMemo(() => {
    return allEvents.filter(ev => {
      if ((ev.importance || 0) < minImportance) return false
      if (topicFilter) {
        const topics = ev.topics || []
        const cat = ev.category || ''
        if (!topics.includes(topicFilter) && cat !== topicFilter) return false
      }
      if (dateRange !== 'all') {
        const now = new Date()
        const eventDate = new Date(ev.timestamp || ev.created_at || 0)
        const days = dateRange === '24h' ? 1 : dateRange === '7d' ? 7 : 30
        if ((now - eventDate) > days * 24 * 60 * 60 * 1000) return false
      }
      if (query) {
        const q = query.toLowerCase()
        const text = `${ev.title || ''} ${ev.summary || ''} ${ev.source || ''} ${ev.keywords?.join(' ') || ''}`.toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  }, [allEvents, query, topicFilter, minImportance, dateRange])

  const clusteredEvents = useMemo(() => {
    const grid = new Map()
    filteredEvents.forEach(ev => {
      const [lat, lon] = ev._coords
      const key = `${lat.toFixed(1)},${lon.toFixed(1)}`
      if (!grid.has(key)) grid.set(key, [])
      grid.get(key).push(ev)
    })
    return Array.from(grid.entries()).map(([key, evts]) => ({
      key, coords: evts[0]._coords, events: evts, count: evts.length,
      maxImportance: Math.max(...evts.map(e => e.importance || 0)),
    }))
  }, [filteredEvents])

  return (
    <div className="map-container-hermes">
      {/* Filters bar */}
      <div className="map-filters-hermes">
        <div className="filter-row">
          <input type="text" className="input-hermes map-search" placeholder="Buscar eventos..."
            value={query} onChange={e => setQuery(e.target.value)} />
          <select className="input-hermes" value={topicFilter} onChange={e => setTopicFilter(e.target.value)}>
            <option value="">Todos los topics</option>
            {allTopics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input-hermes" value={dateRange} onChange={e => setDateRange(e.target.value)}>
            <option value="all">Todo el tiempo</option>
            <option value="24h">Ultimas 24h</option>
            <option value="7d">Ultima semana</option>
            <option value="30d">Ultimo mes</option>
          </select>
          <div className="importance-filter">
            <label>Min: {minImportance}</label>
            <input type="range" min="0" max="100" value={minImportance}
              onChange={e => setMinImportance(Number(e.target.value))} />
          </div>
        </div>
        <div className="map-stats-row">
          <span>{filteredEvents.length} eventos</span>
          <span>{clusteredEvents.length} zonas</span>
        </div>
      </div>

      {/* Legend */}
      <div className="map-legend-hermes">
        <span className="legend-title">Leyenda:</span>
        {tab === 'world' ? (
          <>
            <span className="legend-item"><span className="legend-dot" style={{background:'#ef4444'}}></span>Política</span>
            <span className="legend-item"><span className="legend-dot" style={{background:'#f97316'}}></span>Geopolítica</span>
            <span className="legend-item"><span className="legend-dot" style={{background:'#10b981'}}></span>Economía</span>
            <span className="legend-item"><span className="legend-dot" style={{background:'#06b6d4'}}></span>Tecnología</span>
            <span className="legend-item"><span className="legend-dot" style={{background:'#8b5cf6'}}></span>Deportes</span>
            <span className="legend-item"><span className="legend-dot" style={{background:'#14b8a6'}}></span>Cultura</span>
            <span className="legend-item"><span className="legend-dot" style={{background:'#eab308'}}></span>Otros</span>
          </>
        ) : (
          <>
            <span className="legend-item"><span className="legend-dot" style={{background:'#8b5cf6'}}></span>IA / ML</span>
            <span className="legend-item"><span className="legend-dot" style={{background:'#ef4444'}}></span>Seguridad</span>
            <span className="legend-item"><span className="legend-dot" style={{background:'#f97316'}}></span>Hardware</span>
            <span className="legend-item"><span className="legend-dot" style={{background:'#10b981'}}></span>Software</span>
            <span className="legend-item"><span className="legend-dot" style={{background:'#06b6d4'}}></span>General</span>
          </>
        )}
        <span className="legend-separator">|</span>
        <span className="legend-item"><span className="legend-dot cluster"></span>Agrupado</span>
        <span className="legend-size">
          <span className="legend-circle sm"></span>
          <span className="legend-circle md"></span>
          <span className="legend-circle lg"></span>
          <span>importancia</span>
        </span>
      </div>

      {/* Map */}
      <div className="map-wrapper-hermes">
        <div className="map-grid-overlay"></div>
        <MapContainer center={[20, 0]} zoom={2} minZoom={2} maxZoom={12}
          className="map-canvas-hermes" worldCopyJump>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FlyToBounds events={filteredEvents} />

          {clusteredEvents.map(({ key, coords, events, count }) => (
            <CircleMarker key={key} center={coords}
              radius={count > 1 ? Math.min(28, 10 + count * 2) : getEventRadius(events[0])}
              pathOptions={{
                color: count > 1 ? '#ef4444' : getEventColor(events[0], tab),
                fillColor: count > 1 ? '#ef4444' : getEventColor(events[0], tab),
                fillOpacity: 0.65,
                weight: 2,
              }}
              eventHandlers={{
                click: () => { if (count === 1) setSelectedEvent(events[0]) }
              }}
            >
              <Popup>
                <div className="map-popup-hermes">
                  {count > 1 ? (
                    <>
                      <h4>{count} eventos en esta zona</h4>
                      <div className="popup-list">
                        {events.slice(0, 8).map((ev, i) => (
                          <div key={i} className="popup-item" onClick={() => setSelectedEvent(ev)}>
                            <strong>{ev.title || 'Sin titulo'}</strong>
                            <span>{ev.source} {ev.importance && `⭐${ev.importance}`}</span>
                          </div>
                        ))}
                        {count > 8 && <div className="popup-more">...y {count - 8} mas</div>}
                      </div>
                    </>
                  ) : (
                    <>
                      <h4>{events[0].title || 'Evento'}</h4>
                      {events[0].summary && <p className="popup-desc">{events[0].summary}</p>}
                      <div className="popup-meta-hermes">
                        {events[0].source && <span>📌 {events[0].source}</span>}
                        {events[0].countries && <span>🌍 {events[0].countries.join(', ')}</span>}
                        {events[0].importance && <span>⭐ {events[0].importance}</span>}
                        {events[0].topics && <span>🏷️ {events[0].topics.join(', ')}</span>}
                      </div>
                      {onEditEvent && (
                        <button className="btn-hermes btn-sm popup-edit"
                          onClick={() => onEditEvent(events[0])}>🛠️ Editar</button>
                      )}
                    </>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Event detail panel */}
      {selectedEvent && (
        <div className="event-panel-hermes">
          <div className="event-panel-header">
            <h3>{selectedEvent.title || 'Evento'}</h3>
            <button className="btn-close-hermes" onClick={() => setSelectedEvent(null)}>✕</button>
          </div>
          <div className="event-panel-body">
            {selectedEvent.summary && <p>{selectedEvent.summary}</p>}
            <div className="event-meta-grid">
              {selectedEvent.source && <div className="meta-cell">📌 {selectedEvent.source}</div>}
              {selectedEvent.countries && <div className="meta-cell">🌍 {selectedEvent.countries.join(', ')}</div>}
              {selectedEvent.topics && <div className="meta-cell">🏷️ {selectedEvent.topics.join(', ')}</div>}
              {selectedEvent.importance !== undefined && <div className="meta-cell">⭐ {selectedEvent.importance}</div>}
              {selectedEvent.popularity !== undefined && <div className="meta-cell">📈 {selectedEvent.popularity}</div>}
              {selectedEvent.timestamp && <div className="meta-cell">🕐 {selectedEvent.timestamp}</div>}
              {selectedEvent.url && <div className="meta-cell"><a href={selectedEvent.url} target="_blank" rel="noopener noreferrer">🔗 Enlace</a></div>}
            </div>
            {onEditEvent && (
              <button className="btn-hermes btn-primary" onClick={() => onEditEvent(selectedEvent)}>
                🛠️ Editar evento
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
