# Representación de Datos Hermes

Catálogo completo de variables, datos y métricas que Hermes puede ofrecer a través de su API, organizados por endpoint y caso de uso.

---

## 📡 `/api/stats` — Estado General del Sistema

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `tech_pulse.snapshots` | INTEGER | Número de snapshots Tech Pulse almacenados en la base de datos |
| `tech_pulse.latest` | ISO 8601 | Fecha y hora del último snapshot tech creado |
| `world_news.snapshots` | INTEGER | Número de snapshots World News almacenados |
| `world_news.latest` | ISO 8601 | Fecha y hora del último snapshot mundial creado |

**Uso en web:** Dashboard de estado del sistema, indicadores de frescura de datos, alertas de actualización.

---

## ⚡ `/api/tech` — Lista de Snapshots Tech

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `id` | INTEGER | Identificador único del snapshot |
| `created_at` | ISO 8601 | Fecha/hora de captura del snapshot |
| `source_count` | INTEGER | Número de fuentes consultadas (HN, GitHub, etc.) |
| `event_count` | INTEGER | Total de eventos/noticias capturadas |
| `summary.total_events` | INTEGER | Total de eventos en el JSON |
| `summary.hn_stories` | INTEGER | Historias de HackerNews incluidas |
| `summary.gh_repos` | INTEGER | Repositorios de GitHub Trending incluidos |
| `summary.hermes_mentions` | INTEGER | Menciones de Hermes detectadas |
| `hermes.mentions` | INTEGER | Número de menciones Hermes en este snapshot |
| `events_json` | JSON | Array completo de eventos (ver estructura abajo) |

**Uso en web:** Lista de tarjetas de snapshots, historial de capturas, gráfico temporal.

---

## ⚡ `/api/tech/:id` — Detalle de Snapshot Tech

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `id` | INTEGER | ID del snapshot |
| `created_at` | ISO 8601 | Fecha de captura |
| `source_count` | INTEGER | Fuentes consultadas |
| `events_json` | JSON | Array de eventos con estructura: `{title, summary, source, category, popularity, importance, keywords, url}` |

**Estructura de cada evento tech:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `title` | STRING | Título de la noticia/proyecto |
| `summary` | STRING | Resumen breve |
| `source` | STRING | Fuente (HackerNews, GitHub) |
| `category` | STRING | Categoría (Tech, AI, etc.) |
| `popularity` | FLOAT | Score de popularidad (0-100) |
| `importance` | FLOAT | Score de importancia (0-100) |
| `keywords` | ARRAY | Palabras clave extraídas |
| `url` | STRING | Enlace al contenido original |

**Uso en web:** Detalle de snapshot, lista de eventos con importancia, filtrado por keywords.

---

## 🌍 `/api/world` — Lista de Snapshots Mundiales

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `id` | INTEGER | Identificador único |
| `created_at` | ISO 8601 | Fecha/hora de captura |
| `source_count` | INTEGER | Número de fuentes (Google News RSS, GDELT) |
| `event_count` | INTEGER | Total de eventos mundiales |
| `generated_at` | ISO 8601 | Fecha de generación del contenido |
| `events_json` | JSON | Array de eventos mundiales |

**Estructura de cada evento mundial:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | STRING | ID único del evento |
| `title` | STRING | Titular de la noticia |
| `summary` | STRING | Resumen de la noticia |
| `source` | STRING | Fuente (CNN, DW, NYT, etc.) |
| `countries` | ARRAY | Códigos de país (ISO 3166-1 alpha-2) |
| `topics` | ARRAY | Temas (politics, geopolitics, economy, technology, sports, culture) |
| `timestamp` | STRING | Fecha de la noticia |
| `importance` | FLOAT | Score de importancia (0-100) |

**Uso en web:** Mapa mundial, filtrado por país/topic, timeline de eventos globales.

---

## 🧠 `/api/memory/events` — Eventos de Memoria a Corto Plazo (7 días)

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `events` | ARRAY | Array de eventos recientes |
| `total` | INTEGER | Total de eventos en memoria |

**Estructura de cada evento:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | ID único del evento |
| `timestamp` | ISO 8601 | Fecha/hora del evento |
| `type` | STRING | Tipo: `action`, `conversation`, `insight` |
| `content_json` | JSON | Contenido según tipo (ver abajo) |
| `tags` | STRING | Etiquetas separadas por coma |
| `importance_score` | FLOAT | Puntuación de importancia (0-100) |

**Contenido según tipo:**

- **action:** `{action, project}` — Acción realizada y proyecto asociado
- **conversation:** `{topic, summary}` — Tema discutido y resumen
- **insight:** `{insight, evidence}` — Descubrimiento y evidencia

**Uso en web:** Timeline de actividad, feed de eventos, filtrado por tipo/importancia.

---

## 📅 `/api/memory/weekly` — Resúmenes Semanales

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `id` | INTEGER | ID del resumen |
| `week_start` | ISO 8601 | Inicio de la semana |
| `week_end` | ISO 8601 | Fin de la semana |
| `summary_json` | JSON | `{summary: string}` |
| `key_events_json` | JSON | Array de eventos clave de la semana |
| `decisions_json` | JSON | Array de decisiones tomadas |
| `projects_json` | JSON | Array de proyectos activos |
| `topics_json` | JSON | Array de temas recurrentes |
| `importance_score` | FLOAT | Importancia de la semana (0-100) |

**Uso en web:** Vista semanal tipo calendario, timeline de decisiones, gráfico de actividad por semana.

---

## 🧩 `/api/memory/core` — Memoria a Largo Plazo

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `id` | INTEGER | ID de la entrada |
| `category` | STRING | Categoría: `user_pref`, `project`, `decision`, `knowledge` |
| `content` | STRING | Contenido comprimido del conocimiento |
| `confidence_score` | FLOAT | Nivel de confianza (0.0-1.0) |
| `last_updated` | ISO 8601 | Última actualización |
| `source` | STRING | Origen de la información |

**Uso en web:** Panel de conocimiento, preferencias del usuario, decisiones históricas, base de conocimiento.

---

## 📊 `/api/memory/stats` — Estadísticas de Memoria

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `events_count` | INTEGER | Total de eventos a corto plazo |
| `weekly_count` | INTEGER | Total de resúmenes semanales |
| `core_count` | INTEGER | Total de entradas de memoria larga |
| `avg_importance` | INTEGER | Puntuación media de importancia |
| `last_event` | ISO 8601 | Fecha del último evento registrado |

**Uso en web:** Dashboard de memoria, indicadores de actividad, gráficos de crecimiento.

---

## 🔍 `/api/memory/search?q=` — Búsqueda en Memoria

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `events` | ARRAY | Resultados de búsqueda en eventos |
| `total` | INTEGER | Total de coincidencias |

**Uso en web:** Buscador de memoria, historial de consultas, recuperación de decisiones pasadas.

---

## 📚 `/api/skills` — Lista de Skills

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `skills` | ARRAY | Array de todas las skills disponibles |
| `count` | INTEGER | Total de skills |

**Estructura de cada skill:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | STRING | Nombre de la skill (kebab-case) |
| `description` | STRING | Descripción de qué hace |
| `category` | STRING | Categoría (creative, github, research, etc.) |
| `version` | STRING | Versión de la skill |
| `author` | STRING | Autor |
| `platforms` | ARRAY | Plataformas soportadas |
| `path` | STRING | Ruta al archivo SKILL.md |

**Uso en web:** ListSkill book, buscador de skills, documentación de capacidades.

---

## 📖 `/api/skills/:name` — Contenido de Skill

| Variable | Tipo | Descripción |
|----------|------|-------------|
| (texto plano) | MARKDOWN | Contenido completo del archivo SKILL.md |

**Uso en web:** Visor de documentación, guías de uso, referencia de capacidades.

---

## 🔧 Posibles Nuevos Endpoints (a implementar)

### `GET /api/system/status`
| Variable | Tipo | Descripción |
|----------|------|-------------|
| `uptime` | INTEGER | Tiempo de actividad del servidor (segundos) |
| `memory_usage` | FLOAT | Uso de memoria RAM (MB) |
| `db_size` | INTEGER | Tamaño de bases de datos (bytes) |
| `version` | STRING | Versión de Hermes |
| `active_sessions` | INTEGER | Sesiones activas |

### `GET /api/trends/realtime`
| Variable | Tipo | Descripción |
|----------|------|-------------|
| `trending_topics` | ARRAY | Temas en tendencia ahora |
| `velocity` | FLOAT | Velocidad de crecimiento |
| `sentiment` | FLOAT | Sentimiento general (-1 a 1) |

### `GET /api/projects`
| Variable | Tipo | Descripción |
|----------|------|-------------|
| `projects` | ARRAY | Lista de proyectos activos |
| `active_count` | INTEGER | Proyectos en desarrollo |
| `last_activity` | ISO 8601 | Última actividad registrada |

### `GET /api/cron/jobs`
| Variable | Tipo | Descripción |
|----------|------|-------------|
| `jobs` | ARRAY | Tareas programadas |
| `next_run` | ISO 8601 | Próxima ejecución |
| `last_run` | ISO 8601 | Última ejecución |
| `status` | STRING | Estado (active/paused/error) |

### `GET /api/sessions/recent`
| Variable | Tipo | Descripción |
|----------|------|-------------|
| `sessions` | ARRAY | Sesiones recientes |
| `total_today` | INTEGER | Sesiones hoy |
| `avg_duration` | FLOAT | Duración media (minutos) |

### `GET /api/health`
| Variable | Tipo | Descripción |
|----------|------|-------------|
| `status` | STRING | Estado general (healthy/degraded/down) |
| `checks` | JSON | Estado de cada componente |
| `last_check` | ISO 8601 | Última verificación |

---

## 🎯 Resumen por Pantalla

### Pantalla "Actualidad"
- `tech_pulse.snapshots` / `world_news.snapshots` → contadores
- `tech_pulse.latest` / `world_news.latest` → frescura
- Lista de eventos → `events_json` de cada snapshot
- Eventos individuales → `title`, `source`, `importance`, `url`

### Pantalla "Mapa"
- Eventos mundiales → `countries`, `coords`, `importance`
- Filtros → `topics`, `dateRange`, `importance`
- Clustering → agrupación por zona

### Pantalla "Memoria"
- `events_count` → total eventos recientes
- `weekly_count` → total semanas
- `core_count` → total conocimiento largo
- `avg_importance` → importancia media
- Timeline → eventos ordenados por `timestamp`

### Pantalla "Habilidades"
- `count` → total skills
- Cada skill → `name`, `description`, `category`, `version`
- Contenido → markdown completo

### Pantalla "Sistema"
- `tech_pulse` / `world_news` → estado de snapshots
- `memory_stats` → estado de memoria
- `skills.count` → total skills disponibles
- (Futuro) `system.status` → salud del sistema

---

## 📝 Notas

- Todas las fechas usan formato ISO 8601
- Los scores son flotantes de 0 a 100 (importance, popularity) o 0 a 1 (confidence)
- Los países usan códigos ISO 3166-1 alpha-2 (US, CN, IR, etc.)
- Los topics son strings en inglés (politics, geopolitics, economy, etc.)
- Los tipos de memoria son: action, conversation, insight
- Las categorías de memoria son: user_pref, project, decision, knowledge
