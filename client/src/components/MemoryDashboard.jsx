import { useState, useEffect } from 'react'

const API = '/api'

function MemoryDashboard() {
  const [tab, setTab] = useState('events')
  const [stats, setStats] = useState(null)
  const [events, setEvents] = useState([])
  const [weekly, setWeekly] = useState([])
  const [core, setCore] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [totalEvents, setTotalEvents] = useState(0)

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/memory/stats`)
      if (res.ok) setStats(await res.json())
    } catch {}
  }

  const fetchEvents = async (newOffset = 0) => {
    try {
      const res = await fetch(`${API}/memory/events?limit=20&offset=${newOffset}`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events)
        setTotalEvents(data.total)
        setOffset(newOffset)
      }
    } catch {}
  }

  const fetchWeekly = async () => {
    try {
      const res = await fetch(`${API}/memory/weekly`)
      if (res.ok) setWeekly(await res.json())
    } catch {}
  }

  const fetchCore = async () => {
    try {
      const res = await fetch(`${API}/memory/core`)
      if (res.ok) setCore(await res.json())
    } catch {}
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      fetchEvents()
      return
    }
    try {
      const res = await fetch(`${API}/memory/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) setEvents(await res.json())
    } catch {}
  }

  useEffect(() => {
    setLoading(true)
    fetchStats()
    fetchEvents()
    fetchWeekly()
    fetchCore().then(() => setLoading(false))
  }, [])

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleString('es-ES', {
      dateStyle: 'short', timeStyle: 'short'
    })
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'action': return '⚡'
      case 'conversation': return '💬'
      case 'insight': return '💡'
      default: return '📝'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'action': return 'Acción'
      case 'conversation': return 'Conversación'
      case 'insight': return 'Insight'
      default: return type
    }
  }

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'user_pref': return 'Preferencia'
      case 'project': return 'Proyecto'
      case 'decision': return 'Decisión'
      case 'knowledge': return 'Conocimiento'
      default: return cat
    }
  }

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'user_pref': return '#f39c12'
      case 'project': return '#3498db'
      case 'decision': return '#e74c3c'
      case 'knowledge': return '#2ecc71'
      default: return '#9b59b6'
    }
  }

  const importanceBar = (score) => {
    const pct = Math.min(100, Math.max(0, score))
    const color = pct >= 80 ? '#2ecc71' : pct >= 60 ? '#f39c12' : pct >= 40 ? '#e67e22' : '#e74c3c'
    return (
      <div className="importance-bar">
        <div className="importance-fill" style={{ width: `${pct}%`, background: color }}></div>
        <span className="importance-score">{score}</span>
      </div>
    )
  }

  if (loading) return <div className="loading">Cargando memoria...</div>

  return (
    <div className="memory-app">
      <header className="memory-header">
        <h1>🧠 Hermes <span>Memory</span></h1>
        <p className="subtitle">Sistema de memoria jerárquica — 3 capas</p>
      </header>

      {/* Stats bar */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.events_count}</div>
            <div className="stat-label">Eventos (7d)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.weekly_count}</div>
            <div className="stat-label">Semanas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.core_count}</div>
            <div className="stat-label">Memoria larga</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.avg_importance}</div>
            <div className="stat-label">Importancia media</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.last_event ? formatDate(stats.last_event).split(',')[0] : '-'}</div>
            <div className="stat-label">Último evento</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="memory-tabs">
        <button
          className={`memory-tab ${tab === 'events' ? 'active' : ''}`}
          onClick={() => setTab('events')}
        >
          ⚡ Eventos recientes
        </button>
        <button
          className={`memory-tab ${tab === 'weekly' ? 'active' : ''}`}
          onClick={() => setTab('weekly')}
        >
          📅 Memoria semanal
        </button>
        <button
          className={`memory-tab ${tab === 'core' ? 'active' : ''}`}
          onClick={() => setTab('core')}
        >
          🧩 Memoria a largo plazo
        </button>
      </div>

      {/* Search (only for events tab) */}
      {tab === 'events' && (
        <form className="memory-search" onSubmit={handleSearch}>
          <input
            type="text"
            className="input"
            placeholder="Buscar en memoria..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">🔍 Buscar</button>
          {searchQuery && (
            <button type="button" className="btn" onClick={() => { setSearchQuery(''); fetchEvents() }}>
              ✕ Limpiar
            </button>
          )}
        </form>
      )}

      {/* Content */}
      <div className="memory-content">
        {tab === 'events' && (
          <div className="events-list">
            {events.length === 0 ? (
              <div className="empty">No hay eventos</div>
            ) : (
              events.map(ev => {
                let content = {}
                try { content = JSON.parse(ev.content_json) } catch {}
                return (
                  <div key={ev.id} className="event-card">
                    <div className="event-header">
                      <span className="event-icon">{getTypeIcon(ev.type)}</span>
                      <span className="event-type">{getTypeLabel(ev.type)}</span>
                      <span className="event-date">{formatDate(ev.timestamp)}</span>
                    </div>
                    <div className="event-body">
                      <div className="event-title">
                        {content.action || content.topic || content.insight || 'Evento'}
                      </div>
                      {content.summary && (
                        <div className="event-summary">{content.summary}</div>
                      )}
                      {content.evidence && (
                        <div className="event-evidence">📊 {content.evidence}</div>
                      )}
                      {content.project && (
                        <div className="event-project">📁 {content.project}</div>
                      )}
                    </div>
                    <div className="event-footer">
                      {ev.tags && (
                        <div className="event-tags">
                          {ev.tags.split(',').map((t, i) => (
                            <span key={i} className="tag">{t.trim()}</span>
                          ))}
                        </div>
                      )}
                      {importanceBar(ev.importance_score)}
                    </div>
                  </div>
                )
              })
            )}
            {/* Pagination */}
            {totalEvents > 20 && !searchQuery && (
              <div className="pagination">
                <button
                  className="btn"
                  disabled={offset === 0}
                  onClick={() => fetchEvents(Math.max(0, offset - 20))}
                >
                  ← Anterior
                </button>
                <span className="page-info">
                  {offset + 1}-{Math.min(offset + 20, totalEvents)} de {totalEvents}
                </span>
                <button
                  className="btn"
                  disabled={offset + 20 >= totalEvents}
                  onClick={() => fetchEvents(offset + 20)}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'weekly' && (
          <div className="weekly-list">
            {weekly.length === 0 ? (
              <div className="empty">No hay memoria semanal</div>
            ) : (
              weekly.map(w => {
                let summary = {}, keyEvents = [], decisions = [], projects = [], topics = []
                try {
                  summary = JSON.parse(w.summary_json) || {}
                  keyEvents = JSON.parse(w.key_events_json) || []
                  decisions = JSON.parse(w.decisions_json) || []
                  projects = JSON.parse(w.projects_json) || []
                  topics = JSON.parse(w.topics_json) || []
                } catch {}
                return (
                  <div key={w.id} className="weekly-card">
                    <div className="weekly-header">
                      <h3>📅 {w.week_start} → {w.week_end}</h3>
                      {importanceBar(w.importance_score)}
                    </div>
                    <p className="weekly-summary">{summary.summary}</p>
                    {keyEvents.length > 0 && (
                      <div className="weekly-section">
                        <h4>🔥 Eventos clave</h4>
                        <ul>{keyEvents.map((e, i) => <li key={i}>{e}</li>)}</ul>
                      </div>
                    )}
                    {decisions.length > 0 && (
                      <div className="weekly-section">
                        <h4>⚖️ Decisiones</h4>
                        <ul>{decisions.map((d, i) => <li key={i}>{d}</li>)}</ul>
                      </div>
                    )}
                    {projects.length > 0 && (
                      <div className="weekly-section">
                        <h4>📁 Proyectos activos</h4>
                        <div className="tag-list">
                          {projects.map((p, i) => <span key={i} className="tag">{p}</span>)}
                        </div>
                      </div>
                    )}
                    {topics.length > 0 && (
                      <div className="weekly-section">
                        <h4>🏷️ Temas recurrentes</h4>
                        <div className="tag-list">
                          {topics.map((t, i) => <span key={i} className="tag">{t}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'core' && (
          <div className="core-list">
            {core.length === 0 ? (
              <div className="empty">No hay memoria a largo plazo</div>
            ) : (
              core.map(c => (
                <div key={c.id} className="core-card">
                  <div className="core-header">
                    <span
                      className="core-category"
                      style={{ background: getCategoryColor(c.category) }}
                    >
                      {getCategoryLabel(c.category)}
                    </span>
                    <span className="core-date">{formatDate(c.last_updated)}</span>
                  </div>
                  <div className="core-content">{c.content}</div>
                  <div className="core-footer">
                    <span className="core-confidence">
                      Confianza: {Math.round(c.confidence_score * 100)}%
                    </span>
                    {c.source && <span className="core-source">📎 {c.source}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MemoryDashboard
