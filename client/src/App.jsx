import { useState, useEffect, useCallback } from 'react'
import WorldMap from './components/WorldMap'
import MemoryDashboard from './components/MemoryDashboard'
import ListSkill from './components/ListSkill'

const API = '/api'

function App() {
  const [tab, setTab] = useState('tech')
  const [snapshots, setSnapshots] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editJson, setEditJson] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [toast, setToast] = useState(null)
  const [editingEventId, setEditingEventId] = useState(null)
  const [eventEditData, setEventEditData] = useState({})
  const [snapshotIdForEvent, setSnapshotIdForEvent] = useState(null)
  const [mapView, setMapView] = useState(false)
  const [memoryView, setMemoryView] = useState(false)
  const [listSkillView, setListSkillView] = useState(false)

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

  useEffect(() => {
    fetchSnapshots()
    fetchStats()
    // Check if URL hash points to memory view
    if (window.location.hash === '#/memory') {
      setMemoryView(true)
    }
  }, [fetchSnapshots, fetchStats])

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

  const openEventEditor = (snapshotId, event) => {
    setSnapshotIdForEvent(snapshotId)
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

  const handleEditFromMap = (event) => {
    setSnapshotIdForEvent(event._snapshotId)
    setEditingEventId(event.id)
    setEventEditData({ ...event })
    setViewMode('list')
  }

  const handleSave = async () => {
    try {
      JSON.parse(editJson) // validar
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
      if (events.length === 0) return <p className="empty">Sin eventos</p>
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
              onClick={() => openEventEditor(snapshotId, ev)}
            >
              🛠️ Editar evento
            </button>
          </div>
        </div>
      ))
    } catch {
      return <p className="empty">Error parseando JSON</p>
    }
  }

  return (
    <div className="app">
      <header>
        <h1>News<span>Aggregator</span></h1>
        <div className="header-actions">
          {stats && (
            <div className="stats">
              <div className="stat-badge">⚡ Tech: {stats.tech_pulse.snapshots}</div>
              <div className="stat-badge">🌍 World: {stats.world_news.snapshots}</div>
            </div>
          )}
          <button
            className={`btn btn-memory ${memoryView ? 'btn-primary' : ''}`}
            onClick={() => setMemoryView(!memoryView)}
          >
            🧠 Memoria
          </button>
          <button
            className={`btn btn-skills ${listSkillView ? 'btn-primary' : ''}`}
            onClick={() => setListSkillView(!listSkillView)}
          >
            📚 Skills
          </button>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab tech ${tab === 'tech' ? 'active' : ''}`}
          onClick={() => setTab('tech')}
        >
          ⚡ Tech Pulse
        </button>
        <button
          className={`tab world ${tab === 'world' ? 'active' : ''}`}
          onClick={() => setTab('world')}
        >
          🌍 World News
        </button>
      </div>

      {listSkillView ? (
        <div className="listskill-view">
          <ListSkill />
        </div>
      ) : memoryView ? (
        <div className="memory-view">
          <MemoryDashboard />
        </div>
      ) : editing ? (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editando {tab === 'tech' ? 'Tech Pulse' : 'World News'} #{editing.id}</h2>
              <div className="view-toggle">
                <button className="btn btn-sm" onClick={() => setViewMode('list')}>
                  📋 Lista
                </button>
                <button className="btn btn-sm" onClick={() => setViewMode('json')}>
                  📝 JSON
                </button>
              </div>
            </div>
            <div className="modal-body">
              {viewMode === 'list' ? (
                <div>{renderEvents(editJson, editing.id)}</div>
              ) : (
                <textarea
                  className="editor"
                  value={editJson}
                  onChange={e => setEditJson(e.target.value)}
                  spellCheck={false}
                />
              )}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>💾 Guardar</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="actions">
            <button className="btn" onClick={fetchSnapshots}>🔄 Refrescar</button>
            <button
              className={`btn ${mapView ? 'btn-primary' : ''}`}
              onClick={() => setMapView(!mapView)}
            >
              🗺️ {mapView ? '📋 Ver lista' : '🗺️ Ver mapa'}
            </button>
          </div>

          {loading ? (
            <div className="empty">Cargando...</div>
          ) : snapshots.length === 0 ? (
            <div className="empty">No hay snapshots almacenados</div>
          ) : mapView ? (
            <WorldMap
              snapshots={snapshots}
              tab={tab}
              onEditEvent={handleEditFromMap}
            />
          ) : (
            <div className="snapshot-list">
              {snapshots.map(s => (
                <div key={s.id} className="snapshot-card">
                  <div className="info">
                    <div className="id">Snapshot #{s.id}</div>
                    <div className="meta">
                      <span>🕐 {formatDate(s.created_at)}</span>
                      <span>📊 {s.event_count} eventos</span>
                      <span>📡 {s.source_count} fuentes</span>
                      {s.hermes && s.hermes.mentions > 0 && (
                        <span>🐍 {s.hermes.mentions} Hermes</span>
                      )}
                    </div>
                  </div>
                  <div className="actions">
                    <button className="btn btn-sm" onClick={() => handleEdit(s)}>✏️ Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>🗑️ Borrar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de edición de evento individual */}
      {editingEventId && (
        <div className="modal-overlay" onClick={handleEventModalClose}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar evento #{editingEventId}</h2>
              <button className="btn-close" onClick={handleEventModalClose}>✖</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Título</label>
                <input
                  className="input"
                  placeholder="Título"
                  value={eventEditData.title || ''}
                  onChange={e => setEventEditData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Resumen</label>
                <textarea
                  className="input"
                  placeholder="Resumen"
                  rows={3}
                  value={eventEditData.summary || ''}
                  onChange={e => setEventEditData(prev => ({ ...prev, summary: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Fuente</label>
                <input
                  className="input"
                  placeholder="Fuente"
                  value={eventEditData.source || ''}
                  onChange={e => setEventEditData(prev => ({ ...prev, source: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <input
                  className="input"
                  placeholder="Categoría"
                  value={eventEditData.category || ''}
                  onChange={e => setEventEditData(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Importancia (1-10)</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Importancia"
                  value={eventEditData.importance ?? ''}
                  onChange={e => setEventEditData(prev => ({ ...prev, importance: e.target.value === '' ? undefined : Number(e.target.value) }))}
                />
              </div>
              <div className="form-group">
                <label>Popularidad</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="Popularidad"
                  value={eventEditData.popularity ?? ''}
                  onChange={e => setEventEditData(prev => ({ ...prev, popularity: e.target.value === '' ? undefined : Number(e.target.value) }))}
                />
              </div>
              <div className="form-group">
                <label>Países (separados por coma)</label>
                <input
                  className="input"
                  placeholder="ES, FR, DE..."
                  value={Array.isArray(eventEditData.countries) ? eventEditData.countries.join(', ') : (eventEditData.countries || '')}
                  onChange={e => setEventEditData(prev => ({
                    ...prev,
                    countries: e.target.value ? e.target.value.split(',').map(c => c.trim()).filter(Boolean) : []
                  }))}
                />
              </div>
              <div className="form-group">
                <label>URL</label>
                <input
                  className="input"
                  placeholder="https://..."
                  value={eventEditData.url || ''}
                  onChange={e => setEventEditData(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={handleEventModalClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleEventSave}>💾 Guardar</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

export default App
