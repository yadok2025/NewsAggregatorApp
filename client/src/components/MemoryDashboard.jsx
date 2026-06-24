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
    return new Date(d).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
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
      case 'user_pref': return '#eab308'
      case 'project': return '#06b6d4'
      case 'decision': return '#ef4444'
      case 'knowledge': return '#10b981'
      default: return '#8b5cf6'
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader"></div>
        <p>Cargando memoria...</p>
      </div>
    )
  }

  return (
    <div className="memory-dashboard-hermes">
      {/* Stats bar */}
      {stats && (
        <div className="memory-stats-bar">
          <div className="memory-stat-card">
            <div className="memory-stat-value">{stats.events_count}</div>
            <div className="memory-stat-label">Eventos (7d)</div>
          </div>
          <div className="memory-stat-card">
            <div className="memory-stat-value">{stats.weekly_count}</div>
            <div className="memory-stat-label">Semanas</div>
          </div>
          <div className="memory-stat-card">
            <div className="memory-stat-value">{stats.core_count}</div>
            <div className="memory-stat-label">Memoria larga</div>
          </div>
          <div className="memory-stat-card">
            <div className="memory-stat-value">{stats.avg_importance}</div>
            <div className="memory-stat-label">Importancia media</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="memory-tabs-hermes">
        <button
          className={`memory-tab-hermes ${tab === 'events' ? 'active' : ''}`}
          onClick={() => setTab('events')}
        >
          ⚡ Eventos recientes
        </button>
        <button
          className={`memory-tab-hermes ${tab === 'weekly' ? 'active' : ''}`}
          onClick={() => setTab('weekly')}
        >
          📅 Memoria semanal
        </button>
        <button
          className={`memory-tab-hermes ${tab === 'core' ? 'active' : ''}`}
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
            className="input-hermes memory-search-input"
            placeholder="Buscar en memoria..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-hermes btn-primary">🔍 Buscar</button>
          {searchQuery && (
            <button type="button" className="btn-hermes" onClick={() => { setSearchQuery(''); fetchEvents() }}>
              ✕ Limpiar
            </button>
          )}
        </form>
      )}

      {/* Content */}
      <div className="memory-content">
        {tab === 'events' && (
          <div className="memory-list-hermes">
            {events.length === 0 ? (
              <div className="memory-empty">
                <span className="memory-empty-icon">📭</span>
                <p>No hay eventos</p>
              </div>
            ) : (
              events.map(ev => {
                let content = {}
                try { content = JSON.parse(ev.content_json) } catch {}
                return (
                  <div key={ev.id} className="memory-card-hermes">
                    <div className="memory-card-header">
                      <span className="memory-card-icon">{getTypeIcon(ev.type)}</span>
                      <span className="memory-card-type">{getTypeLabel(ev.type)}</span>
                      <span className="memory-card-date">{formatDate(ev.timestamp)}</span>
                    </div>
                    <div className="memory-card-title">
                      {content.action || content.topic || content.insight || 'Evento'}
                    </div>
                    {content.summary && (
                      <div className="memory-card-desc">{content.summary}</div>
                    )}
                    {content.evidence && (
                      <div className="memory-card-desc">📊 {content.evidence}</div>
                    )}
                    <div className="memory-card-footer">
                      {content.project && (
                        <span className="memory-card-project">📁 {content.project}</span>
                      )}
                      <div className="memory-importance-bar">
                        <div className="memory-importance-fill"
                          style={{ width: `${Math.min(100, ev.importance || 0)}%` }}></div>
                      </div>
                    </div>
                    {ev.tags && (
                      <div className="memory-card-tags">
                        {ev.tags.split(',').map((t, i) => (
                          <span key={i} className="memory-tag">{t.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
            {totalEvents > 20 && !searchQuery && (
              <div className="memory-pagination">
                <button className="btn-hermes" disabled={offset === 0}
                  onClick={() => fetchEvents(Math.max(0, offset - 20))}>
                  ← Anterior
                </button>
                <span>{offset + 1}-{Math.min(offset + 20, totalEvents)} de {totalEvents}</span>
                <button className="btn-hermes" disabled={offset + 20 >= totalEvents}
                  onClick={() => fetchEvents(offset + 20)}>
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'weekly' && (
          <div className="memory-list-hermes">
            {weekly.length === 0 ? (
              <div className="memory-empty">
                <span className="memory-empty-icon">📭</span>
                <p>No hay memoria semanal</p>
              </div>
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
                  <div key={w.id} className="memory-card-hermes">
                    <div className="memory-card-header">
                      <span className="memory-card-icon">📅</span>
                      <span className="memory-card-type">Semana</span>
                      <span className="memory-card-date">{w.week_start} → {w.week_end}</span>
                    </div>
                    <div className="memory-card-title">{summary.summary}</div>
                    {keyEvents.length > 0 && (
                      <div className="memory-section">
                        <h4>🔥 Eventos clave</h4>
                        <ul>{keyEvents.map((e, i) => <li key={i}>{e}</li>)}</ul>
                      </div>
                    )}
                    {decisions.length > 0 && (
                      <div className="memory-section">
                        <h4>⚖️ Decisiones</h4>
                        <ul>{decisions.map((d, i) => <li key={i}>{d}</li>)}</ul>
                      </div>
                    )}
                    {projects.length > 0 && (
                      <div className="memory-section">
                        <h4>📁 Proyectos activos</h4>
                        <div className="memory-card-tags">
                          {projects.map((p, i) => <span key={i} className="memory-tag">{p}</span>)}
                        </div>
                      </div>
                    )}
                    {topics.length > 0 && (
                      <div className="memory-section">
                        <h4>🏷️ Temas recurrentes</h4>
                        <div className="memory-card-tags">
                          {topics.map((t, i) => <span key={i} className="memory-tag">{t}</span>)}
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
          <div className="memory-list-hermes">
            {core.length === 0 ? (
              <div className="memory-empty">
                <span className="memory-empty-icon">📭</span>
                <p>No hay memoria a largo plazo</p>
              </div>
            ) : (
              core.map(c => (
                <div key={c.id} className="memory-card-hermes">
                  <div className="memory-card-header">
                    <span className="memory-card-icon">🧩</span>
                    <span className="memory-card-type"
                      style={{ color: getCategoryColor(c.category) }}>
                      {getCategoryLabel(c.category)}
                    </span>
                    <span className="memory-card-date">{formatDate(c.last_updated)}</span>
                  </div>
                  <div className="memory-card-title">{c.content}</div>
                  <div className="memory-card-footer">
                    <span>Confianza: {Math.round(c.confidence_score * 100)}%</span>
                    {c.source && <span className="memory-card-project">📎 {c.source}</span>}
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
