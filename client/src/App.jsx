import { useState, useEffect, useCallback } from 'react'
import WorldMap from './components/WorldMap'
import MemoryDashboard from './components/MemoryDashboard'
import ListSkill from './components/ListSkill'

const API = '/api'

function App() {
  const [mainView, setMainView] = useState('actualidad') // actualidad | mapa | memoria | skills | stats
  const [tab, setTab] = useState('tech')
  const [snapshots, setSnapshots] = useState([])
  const [stats, setStats] = useState(null)
  const [memoryStats, setMemoryStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editJson, setEditJson] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [toast, setToast] = useState(null)
  const [editingEventId, setEditingEventId] = useState(null)
  const [eventEditData, setEventEditData] = useState({})
  const [snapshotIdForEvent, setSnapshotIdForEvent] = useState(null)
  const [darkMode, setDarkMode] = useState(true)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const fetchSnapshots = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/${tab}`)
      const data = await res.json()
      setSnapshots(data)
    } catch (err) {
      showToast('Error cargando snapshots', 'error')
    }
    setLoading(false)
  }, [tab, showToast])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/stats`)
      const data = await res.json()
      setStats(data)
    } catch {}
  }, [])

  const fetchMemoryStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/memory/stats`)
      if (res.ok) setMemoryStats(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    fetchSnapshots()
    fetchStats()
    fetchMemoryStats()
  }, [fetchSnapshots, fetchStats, fetchMemoryStats])

  const handleDelete = async (id) => {
    if (!confirm(`¿Borrar snapshot #${id}?`)) return
    try {
      const res = await fetch(`${API}/${tab}/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast(`Snapshot #${id} borrado`)
        fetchSnapshots()
        fetchStats()
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al borrar', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    }
  }

  const handleEdit = (snapshot) => {
    setEditing(snapshot)
    setEditJson(snapshot.events_json)
    setViewMode('list')
  }

  const handleSave = async () => {
    try {
      JSON.parse(editJson)
      const res = await fetch(`${API}/${tab}/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events_json: editJson })
      })
      if (res.ok) {
        showToast(`Snapshot #${editing.id} actualizado`)
        setEditing(null)
        fetchSnapshots()
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al guardar', 'error')
      }
    } catch {
      showToast('JSON inválido', 'error')
    }
  }

  const handleEditFromMap = (event) => {
    setSnapshotIdForEvent(event._snapshotId)
    setEditingEventId(event.id)
    setEventEditData({ ...event })
    setViewMode('list')
  }

  const handleEventModalClose = () => {
    setEditingEventId(null)
    setEventEditData({})
    setSnapshotIdForEvent(null)
  }

  const handleEventSave = async () => {
    try {
      const res = await fetch(
        `${API}/${tab}/${snapshotIdForEvent}/events/${editingEventId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: eventEditData }),
        }
      )
      if (res.ok) {
        showToast(`Evento #${editingEventId} actualizado`)
        fetchSnapshots()
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al guardar evento', 'error')
      }
    } catch (e) {
      showToast('Error de conexión', 'error')
    } finally {
      handleEventModalClose()
    }
  }

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleString('es-ES', {
      dateStyle: 'short', timeStyle: 'short'
    })
  }

  const renderEvents = (eventsJson, snapshotId) => {
    try {
      const parsed = JSON.parse(eventsJson)
      const events = parsed.events || parsed.topics || []
      if (events.length === 0) return <p className="empty-text">Sin eventos</p>
      return events.slice(0, 20).map((ev, i) => (
        <div key={i} className="event-item">
          <div className="event-title">{ev.title || ev.summary || 'Sin título'}</div>
          <div className="event-meta">
            {ev.source && <span>📌 {ev.source}</span>}
            {ev.category && <span>🏷️ {ev.category}</span>}
            {ev.importance !== undefined && <span>⭐ {ev.importance}</span>}
            {ev.popularity !== undefined && <span>📈 {ev.popularity}</span>}
            {ev.countries && ev.countries.length > 0 && <span>🌍 {ev.countries.join(', ')}</span>}
          </div>
          <div className="event-actions">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleEditFromMap({ ...ev, _snapshotId: snapshotId, id: ev.id || i })}
            >
              🛠️ Editar
            </button>
          </div>
        </div>
      ))
    } catch {
      return <p className="empty-text">Error parseando JSON</p>
    }
  }

  const navItems = [
    { id: 'actualidad', label: 'Actualidad', icon: '⚡' },
    { id: 'mapa', label: 'Mapa', icon: '🗺️' },
    { id: 'memoria', label: 'Memoria', icon: '🧠' },
    { id: 'skills', label: 'Habilidades', icon: '📚' },
    { id: 'stats', label: 'Sistema', icon: '📊' },
  ]

  return (
    <div className={`hermes-app ${darkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className="hermes-header">
        <div className="header-brand">
          <div className="logo-container">
            <div className="logo-glow"></div>
            <span className="logo-icon">🐍</span>
          </div>
          <div className="brand-text">
            <h1>HERMES</h1>
            <span className="brand-sub">Intelligence System</span>
          </div>
        </div>

        <nav className="main-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-btn ${mainView === item.id ? 'active' : ''}`}
              onClick={() => setMainView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="header-controls">
          <button
            className="btn-theme-hermes"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="hermes-main">
        {mainView === 'actualidad' && (
          <section className="section-actualidad">
            <div className="section-header">
              <h2>📡 Actualidad</h2>
              <p>Snapshots de noticias tech y mundiales en tiempo real</p>
            </div>

            <div className="tabs-hermes">
              <button
                className={`tab-hermes ${tab === 'tech' ? 'active' : ''}`}
                onClick={() => setTab('tech')}
              >
                ⚡ Tech Pulse
              </button>
              <button
                className={`tab-hermes ${tab === 'world' ? 'active' : ''}`}
                onClick={() => setTab('world')}
              >
                🌍 World News
              </button>
            </div>

            <div className="actions-bar">
              <button className="btn-hermes" onClick={fetchSnapshots}>🔄 Refrescar</button>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loader"></div>
                <p>Cargando snapshots...</p>
              </div>
            ) : snapshots.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>No hay snapshots almacenados</p>
              </div>
            ) : (
              <div className="snapshot-grid">
                {snapshots.map(s => (
                  <div key={s.id} className="snapshot-card-hermes">
                    <div className="card-header-hermes">
                      <span className="card-id">#{s.id}</span>
                      <span className="card-date">{formatDate(s.created_at)}</span>
                    </div>
                    <div className="card-body-hermes">
                      <div className="card-stats">
                        <div className="card-stat">
                          <span className="stat-num">{s.event_count}</span>
                          <span className="stat-label">eventos</span>
                        </div>
                        <div className="card-stat">
                          <span className="stat-num">{s.source_count}</span>
                          <span className="stat-label">fuentes</span>
                        </div>
                        {s.hermes && s.hermes.mentions > 0 && (
                          <div className="card-stat hermes-mentions">
                            <span className="stat-num">🐍 {s.hermes.mentions}</span>
                            <span className="stat-label">Hermes</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="card-actions-hermes">
                      <button className="btn-hermes btn-sm" onClick={() => handleEdit(s)}>✏️ Editar</button>
                      <button className="btn-hermes btn-sm btn-danger" onClick={() => handleDelete(s.id)}>🗑️ Borrar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {mainView === 'mapa' && (
          <section className="section-mapa">
            <div className="section-header">
              <h2>🗺️ Mapa Global</h2>
              <p>Distribución geográfica de eventos noticiosos</p>
            </div>
            <WorldMap
              snapshots={snapshots}
              tab={tab}
              onEditEvent={handleEditFromMap}
            />
          </section>
        )}

        {mainView === 'memoria' && (
          <section className="section-memoria">
            <MemoryDashboard />
          </section>
        )}

        {mainView === 'skills' && (
          <section className="section-skills">
            <ListSkill darkMode={darkMode} setDarkMode={setDarkMode} />
          </section>
        )}

        {mainView === 'stats' && (
          <section className="section-stats">
            <div className="section-header">
              <h2>📊 Estado del Sistema</h2>
              <p>Métricas y estado de todos los componentes Hermes</p>
            </div>
            <SystemStats stats={stats} memoryStats={memoryStats} />
          </section>
        )}
      </main>

      {/* Event edit modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-hermes" onClick={e => e.stopPropagation()}>
            <div className="modal-header-hermes">
              <h3>Editando {tab === 'tech' ? 'Tech Pulse' : 'World News'} #{editing.id}</h3>
              <div className="view-toggle">
                <button className="btn-hermes btn-sm" onClick={() => setViewMode('list')}>📋 Lista</button>
                <button className="btn-hermes btn-sm" onClick={() => setViewMode('json')}>📝 JSON</button>
              </div>
            </div>
            <div className="modal-body-hermes">
              {viewMode === 'list' ? (
                <div>{renderEvents(editJson, editing.id)}</div>
              ) : (
                <textarea
                  className="editor-hermes"
                  value={editJson}
                  onChange={e => setEditJson(e.target.value)}
                  spellCheck={false}
                />
              )}
            </div>
            <div className="modal-footer-hermes">
              <button className="btn-hermes" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn-hermes btn-primary" onClick={handleSave}>💾 Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Event inline edit modal */}
      {editingEventId && (
        <div className="modal-overlay" onClick={handleEventModalClose}>
          <div className="modal-hermes modal-event" onClick={e => e.stopPropagation()}>
            <div className="modal-header-hermes">
              <h3>Editar evento #{editingEventId}</h3>
              <button className="btn-close-hermes" onClick={handleEventModalClose}>✕</button>
            </div>
            <div className="modal-body-hermes">
              <div className="form-group">
                <label>Título</label>
                <input className="input-hermes" placeholder="Título"
                  value={eventEditData.title || ''}
                  onChange={e => setEventEditData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Resumen</label>
                <textarea className="input-hermes" rows={3} placeholder="Resumen"
                  value={eventEditData.summary || ''}
                  onChange={e => setEventEditData(prev => ({ ...prev, summary: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Fuente</label>
                <input className="input-hermes" placeholder="Fuente"
                  value={eventEditData.source || ''}
                  onChange={e => setEventEditData(prev => ({ ...prev, source: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <input className="input-hermes" placeholder="Categoría"
                  value={eventEditData.category || ''}
                  onChange={e => setEventEditData(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Importancia (1-100)</label>
                <input className="input-hermes" type="number" min="0" max="100"
                  value={eventEditData.importance ?? ''}
                  onChange={e => setEventEditData(prev => ({ ...prev, importance: e.target.value === '' ? undefined : Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="modal-footer-hermes">
              <button className="btn-hermes" onClick={handleEventModalClose}>Cancelar</button>
              <button className="btn-hermes btn-primary" onClick={handleEventSave}>💾 Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast-hermes ${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

/* System Stats Component */
function SystemStats({ stats, memoryStats }) {
  const cards = [
    {
      icon: '⚡',
      title: 'Tech Pulse',
      value: stats?.tech_pulse?.snapshots || 0,
      desc: 'snapshots almacenados',
      color: '#8b5cf6'
    },
    {
      icon: '🌍',
      title: 'World News',
      value: stats?.world_news?.snapshots || 0,
      desc: 'snapshots almacenados',
      color: '#06b6d4'
    },
    {
      icon: '🧠',
      title: 'Eventos',
      value: memoryStats?.events_count || 0,
      desc: 'en memoria corto plazo',
      color: '#f59e0b'
    },
    {
      icon: '📅',
      title: 'Semanas',
      value: memoryStats?.weekly_count || 0,
      desc: 'resúmenes semanales',
      color: '#10b981'
    },
    {
      icon: '🧩',
      title: 'Memoria Larga',
      value: memoryStats?.core_count || 0,
      desc: 'entradas estables',
      color: '#ec4899'
    },
    {
      icon: '📈',
      title: 'Importancia Media',
      value: memoryStats?.avg_importance || 0,
      desc: 'score promedio',
      color: '#6366f1'
    },
  ]

  return (
    <div className="stats-grid">
      {cards.map((card, i) => (
        <div key={i} className="stat-card-hermes" style={{ '--accent': card.color }}>
          <div className="stat-icon-hermes">{card.icon}</div>
          <div className="stat-value-hermes">{card.value}</div>
          <div className="stat-title-hermes">{card.title}</div>
          <div className="stat-desc-hermes">{card.desc}</div>
        </div>
      ))}
    </div>
  )
}

export default App
