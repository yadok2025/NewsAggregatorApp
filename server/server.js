const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- DB Paths (directo a las DBs de Hermes) ---
const TECH_PULSE_DB = '/home/yadok/.hermes/data/tech_pulse.db';
const WORLD_NEWS_DB = '/home/yadok/.hermes/data/world_news.db';

function getTechDb() { return new Database(TECH_PULSE_DB, { readonly: false }); }
function getWorldDb() { return new Database(WORLD_NEWS_DB, { readonly: false }); }

// ==================== TECH PULSE ====================

// Listar snapshots
app.get('/api/tech', (req, res) => {
  try {
    const db = getTechDb();
    const rows = db.prepare('SELECT id, created_at, source_count, events_json FROM snapshots ORDER BY id DESC').all();
    const result = rows.map(r => {
      let events = [];
      let parsed = {};
      try { parsed = JSON.parse(r.events_json); } catch(e) {}
      events = parsed.events || parsed.topics || [];
      return {
        id: r.id,
        created_at: r.created_at,
        source_count: r.source_count,
        event_count: events.length,
        summary: parsed.summary || {},
        hermes: parsed.hermes || null,
        events_json: r.events_json
      };
    });
    db.close();
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener un snapshot completo
app.get('/api/tech/:id', (req, res) => {
  try {
    const db = getTechDb();
    const row = db.prepare('SELECT * FROM snapshots WHERE id = ?').get(req.params.id);
    db.close();
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Editar events_json de un snapshot
app.put('/api/tech/:id', (req, res) => {
  try {
    const { events_json } = req.body;
    if (!events_json) return res.status(400).json({ error: 'events_json requerido' });
    // Validar JSON
    JSON.parse(events_json);
    const db = getTechDb();
    const result = db.prepare('UPDATE snapshots SET events_json = ? WHERE id = ?').run(events_json, req.params.id);
    db.close();
    if (result.changes === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true, changes: result.changes });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Editar un evento individual dentro de events_json (Tech Pulse)
app.put('/api/tech/:id/events/:eventId', (req, res) => {
  try {
    const { updates } = req.body; // {field: value, ...}
    if (!updates) return res.status(400).json({ error: 'updates requerido' });
    const db = getTechDb();
    const row = db.prepare('SELECT events_json FROM snapshots WHERE id = ?').get(req.params.id);
    if (!row) { db.close(); return res.status(404).json({ error: 'snapshot no encontrado' }); }
    const parsed = JSON.parse(row.events_json);
    const events = parsed.events || [];
    const idx = events.findIndex(e => e.id == req.params.eventId);
    if (idx === -1) { db.close(); return res.status(404).json({ error: 'evento no encontrado' }); }
    Object.assign(events[idx], updates);
    parsed.events = events;
    const newJson = JSON.stringify(parsed);
    const result = db.prepare('UPDATE snapshots SET events_json = ? WHERE id = ?').run(newJson, req.params.id);
    db.close();
    res.json({ ok: true, updated: result.changes });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Borrar evento individual (Tech Pulse)
app.delete('/api/tech/:id/events/:eventId', (req, res) => {
  try {
    const db = getTechDb();
    const row = db.prepare('SELECT events_json FROM snapshots WHERE id = ?').get(req.params.id);
    if (!row) { db.close(); return res.status(404).json({ error: 'snapshot no encontrado' }); }
    const parsed = JSON.parse(row.events_json);
    const events = parsed.events || [];
    const newEvents = events.filter(e => e.id != req.params.eventId);
    if (newEvents.length === events.length) { db.close(); return res.status(404).json({ error: 'evento no encontrado' }); }
    parsed.events = newEvents;
    const newJson = JSON.stringify(parsed);
    const result = db.prepare('UPDATE snapshots SET events_json = ? WHERE id = ?').run(newJson, req.params.id);
    db.close();
    res.json({ ok: true, deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Borrar snapshot
app.delete('/api/tech/:id', (req, res) => {
  try {
    const db = getTechDb();
    const result = db.prepare('DELETE FROM snapshots WHERE id = ?').run(req.params.id);
    db.close();
    if (result.changes === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true, deleted: result.changes });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== WORLD NEWS ====================

// Listar snapshots
app.get('/api/world', (req, res) => {
  try {
    const db = getWorldDb();
    const rows = db.prepare('SELECT id, created_at, source_count, events_json FROM news_snapshots ORDER BY id DESC').all();
    const result = rows.map(r => {
      let events = [];
      let parsed = {};
      try { parsed = JSON.parse(r.events_json); } catch(e) {}
      events = parsed.events || [];
      return {
        id: r.id,
        created_at: r.created_at,
        source_count: r.source_count,
        event_count: events.length,
        generated_at: parsed.generated_at || null,
        events_json: r.events_json
      };
    });
    db.close();
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener un snapshot completo
app.get('/api/world/:id', (req, res) => {
  try {
    const db = getWorldDb();
    const row = db.prepare('SELECT * FROM news_snapshots WHERE id = ?').get(req.params.id);
    db.close();
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Editar events_json de un snapshot
app.put('/api/world/:id', (req, res) => {
  try {
    const { events_json } = req.body;
    if (!events_json) return res.status(400).json({ error: 'events_json requerido' });
    JSON.parse(events_json);
    const db = getWorldDb();
    const result = db.prepare('UPDATE news_snapshots SET events_json = ? WHERE id = ?').run(events_json, req.params.id);
    db.close();
    if (result.changes === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true, changes: result.changes });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Borrar snapshot
app.delete('/api/world/:id', (req, res) => {
  try {
    const db = getWorldDb();
    const result = db.prepare('DELETE FROM news_snapshots WHERE id = ?').run(req.params.id);
    db.close();
    if (result.changes === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true, deleted: result.changes });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== STATS ====================

app.get('/api/stats', (req, res) => {
  try {
    const tdb = getTechDb();
    const wdb = getWorldDb();
    const techCount = tdb.prepare('SELECT COUNT(*) as c FROM snapshots').get().c;
    const worldCount = wdb.prepare('SELECT COUNT(*) as c FROM news_snapshots').get().c;
    const techLatest = tdb.prepare('SELECT created_at FROM snapshots ORDER BY id DESC LIMIT 1').get();
    const worldLatest = wdb.prepare('SELECT created_at FROM news_snapshots ORDER BY id DESC LIMIT 1').get();
    tdb.close();
    wdb.close();
    res.json({
      tech_pulse: { snapshots: techCount, latest: techLatest ? techLatest.created_at : null },
      world_news: { snapshots: worldCount, latest: worldLatest ? worldLatest.created_at : null }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== HERMES MEMORY ====================

const HERMES_MEMORY_DB = '/home/yadok/.hermes/data/hermes_memory.db';

function getMemoryDb() { return new Database(HERMES_MEMORY_DB, { readonly: false }); }

// Obtener eventos de memoria a corto plazo
app.get('/api/memory/events', (req, res) => {
  try {
    const db = getMemoryDb();
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const rows = db.prepare(
      'SELECT * FROM events_log ORDER BY timestamp DESC LIMIT ? OFFSET ?'
    ).all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as c FROM events_log').get().c;
    db.close();
    res.json({ events: rows, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener memoria semanal
app.get('/api/memory/weekly', (req, res) => {
  try {
    const db = getMemoryDb();
    const rows = db.prepare(
      'SELECT * FROM weekly_memory ORDER BY week_start DESC'
    ).all();
    db.close();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener memoria a largo plazo
app.get('/api/memory/core', (req, res) => {
  try {
    const db = getMemoryDb();
    const rows = db.prepare(
      'SELECT * FROM core_memory ORDER BY last_updated DESC'
    ).all();
    db.close();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Estadísticas de memoria
app.get('/api/memory/stats', (req, res) => {
  try {
    const db = getMemoryDb();
    const eventsCount = db.prepare('SELECT COUNT(*) as c FROM events_log').get().c;
    const weeklyCount = db.prepare('SELECT COUNT(*) as c FROM weekly_memory').get().c;
    const coreCount = db.prepare('SELECT COUNT(*) as c FROM core_memory').get().c;
    const avgImportance = db.prepare('SELECT AVG(importance_score) as avg FROM events_log').get().avg;
    const lastEvent = db.prepare('SELECT timestamp FROM events_log ORDER BY id DESC LIMIT 1').get();
    db.close();
    res.json({
      events_count: eventsCount,
      weekly_count: weeklyCount,
      core_count: coreCount,
      avg_importance: Math.round(avgImportance || 0),
      last_event: lastEvent ? lastEvent.timestamp : null
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Buscar en memoria
app.get('/api/memory/search', (req, res) => {
  try {
    const db = getMemoryDb();
    const q = `%${(req.query.q || '').toLowerCase()}%`;
    const rows = db.prepare(
      'SELECT * FROM events_log WHERE LOWER(content_json) LIKE ? OR LOWER(tags) LIKE ? ORDER BY timestamp DESC LIMIT 50'
    ).all(q, q);
    db.close();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== SKILLS API ====================

const SKILLS_DIR = '/home/yadok/.hermes/skills';

// Listar todas las skills
app.get('/api/skills', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const skills = [];

    function scanDir(dir, category = null) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath, entry.name);
        } else if (entry.name === 'SKILL.md') {
          const content = fs.readFileSync(fullPath, 'utf-8');
          // Parse frontmatter
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          let meta = {};
          if (frontmatterMatch) {
            const fm = frontmatterMatch[1];
            fm.split('\n').forEach(line => {
              const colonIdx = line.indexOf(':');
              if (colonIdx > 0) {
                const key = line.substring(0, colonIdx).trim();
                const val = line.substring(colonIdx + 1).trim();
                meta[key] = val;
              }
            });
          }
          skills.push({
            name: meta.name || path.basename(path.dirname(fullPath)),
            description: meta.description || '',
            category: category || meta.category || null,
            version: meta.version || null,
            author: meta.author || null,
            platforms: meta.platforms ? meta.platforms.split(';') : [],
            path: fullPath.replace(SKILLS_DIR + '/', '')
          });
        }
      }
    }

    scanDir(SKILLS_DIR);
    res.json({ skills, count: skills.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener contenido de una skill
app.get('/api/skills/:name', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const skillName = req.params.name;

    // Buscar la skill en el directorio
    function findSkill(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const found = findSkill(fullPath);
          if (found) return found;
        } else if (entry.name === 'SKILL.md' && path.basename(dir) === skillName) {
          return fullPath;
        }
      }
      return null;
    }

    const skillPath = findSkill(SKILLS_DIR);
    if (!skillPath) return res.status(404).json({ error: 'Skill no encontrada' });

    const content = fs.readFileSync(skillPath, 'utf-8');
    res.type('text/plain').send(content);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== FRONTEND (producción) ====================

// Servir el build del cliente si existe
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API no encontrada' });
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Editar un evento individual dentro de events_json (World News)
app.put('/api/world/:id/events/:eventId', (req, res) => {
  try {
    const { updates } = req.body;
    if (!updates) return res.status(400).json({ error: 'updates requerido' });
    const db = getWorldDb();
    const row = db.prepare('SELECT events_json FROM news_snapshots WHERE id = ?').get(req.params.id);
    if (!row) { db.close(); return res.status(404).json({ error: 'snapshot no encontrado' }); }
    const parsed = JSON.parse(row.events_json);
    const events = parsed.events || [];
    const idx = events.findIndex(e => e.id == req.params.eventId);
    if (idx === -1) { db.close(); return res.status(404).json({ error: 'evento no encontrado' }); }
    Object.assign(events[idx], updates);
    parsed.events = events;
    const newJson = JSON.stringify(parsed);
    const result = db.prepare('UPDATE news_snapshots SET events_json = ? WHERE id = ?').run(newJson, req.params.id);
    db.close();
    res.json({ ok: true, updated: result.changes });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Borrar evento individual (World News)
app.delete('/api/world/:id/events/:eventId', (req, res) => {
  try {
    const db = getWorldDb();
    const row = db.prepare('SELECT events_json FROM news_snapshots WHERE id = ?').get(req.params.id);
    if (!row) { db.close(); return res.status(404).json({ error: 'snapshot no encontrado' }); }
    const parsed = JSON.parse(row.events_json);
    const events = parsed.events || [];
    const newEvents = events.filter(e => e.id != req.params.eventId);
    if (newEvents.length === events.length) { db.close(); return res.status(404).json({ error: 'evento no encontrado' }); }
    parsed.events = newEvents;
    const newJson = JSON.stringify(parsed);
    const result = db.prepare('UPDATE news_snapshots SET events_json = ? WHERE id = ?').run(newJson, req.params.id);
    db.close();
    res.json({ ok: true, deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Editar cualquier columna de snapshot (World News)
app.patch('/api/world/:id', (req, res) => {
  try {
    const { field, value } = req.body;
    if (!field) return res.status(400).json({ error: 'field requerido' });
    const db = getWorldDb();
    const stmt = db.prepare(`UPDATE news_snapshots SET ${field} = ? WHERE id = ?`);
    const result = stmt.run(value, req.params.id);
    db.close();
    if (result.changes === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true, changed: field });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => {
  console.log(`NewsAggregator App corriendo en http://localhost:${PORT}`);
  console.log(`  API Tech Pulse:  http://localhost:${PORT}/api/tech`);
  console.log(`  API World News:  http://localhost:${PORT}/api/world`);
  console.log(`  API Memory:      http://localhost:${PORT}/api/memory`);
  console.log(`  API Skills:      http://localhost:${PORT}/api/skills`);
  console.log(`  Stats:           http://localhost:${PORT}/api/stats`);
});
