# NewsAggregatorApp

Aplicación web fullstack para consultar, editar y gestionar snapshots de noticias de **Tech Pulse** y **World News**, con mapa mundial interactivo, sistema de memoria jerárquica y visor de skills.

## Características

- **Tech Pulse**: Consulta y edita snapshots de noticias tech (HackerNews + GitHub Trending)
- **World News**: Consulta y edita snapshots de noticias mundiales (Google News RSS)
- **Mapa mundial interactivo**: Visualiza eventos por ubicación geográfica con Leaflet
- **Edición de eventos**: Modal para editar cualquier campo de un evento individual
- **Sistema de filtros**: Búsqueda por texto, topic, fecha e importancia
- **Memoria jerárquica**: 3 capas (corto plazo, semanal, largo plazo) con SQLite
- **ListSkill**: Visor tipo libro de todas las skills de Hermes (96 skills)
- **Responsive**: Interfaz oscura con tema claro/oscuro optimizada para lectura

## Arquitectura

```
NewsAggregatorApp/
├── server/          # Backend Express.js + SQLite
│   └── server.js    # API REST + frontend estático
├── client/          # Frontend React + Vite
│   ├── src/
│   │   ├── App.jsx              # Componente principal
│   │   ├── components/
│   │   │   ├── WorldMap.jsx     # Mapa mundial con Leaflet
│   │   │   ├── MemoryDashboard.jsx  # Dashboard de memoria
│   │   │   └── ListSkill.jsx    # Visor tipo libro de skills
│   │   └── index.css            # Estilos globales (tema oscuro/claro)
│   └── vite.config.js
├── run.sh           # Script de lanzamiento (backend + frontend)
├── run-memory.sh    # Script para abrir la web de memoria
└── README.md
```

## API Endpoints

### Tech Pulse
- `GET /api/tech` — Listar snapshots
- `GET /api/tech/:id` — Obtener snapshot completo
- `PUT /api/tech/:id` — Editar events_json
- `DELETE /api/tech/:id` — Borrar snapshot
- `PUT /api/tech/:id/events/:eventId` — Editar evento individual

### World News
- `GET /api/world` — Listar snapshots
- `GET /api/world/:id` — Obtener snapshot completo
- `PUT /api/world/:id` — Editar events_json
- `DELETE /api/world/:id` — Borrar snapshot
- `PUT /api/world/:id/events/:eventId` — Editar evento individual

### Memoria Hermes
- `GET /api/memory/events` — Eventos recientes (7 días)
- `GET /api/memory/weekly` — Resúmenes semanales
- `GET /api/memory/core` — Memoria a largo plazo
- `GET /api/memory/stats` — Estadísticas
- `GET /api/memory/search?q=` — Búsqueda en memoria

### Skills
- `GET /api/skills` — Listar todas las skills
- `GET /api/skills/:name` — Contenido de una skill

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/yadok2025/NewsAggregatorApp.git
cd NewsAggregatorApp

# Instalar dependencias backend
cd server && npm install && cd ..

# Instalar dependencias frontend
cd client && npm install && cd ..
```

## Uso

```bash
# Opción 1: Script de lanzamiento
bash run.sh

# Opción 2: Manual
cd server && node server.js &
cd client && npm run dev
```

Abre http://localhost:5173 en tu navegador.

### Navegación

- **Inicio**: Vista principal con lista de snapshots y mapa
- **🧠 Memoria**: Dashboard de memoria jerárquica (3 capas)
- **📚 Skills**: Visor tipo libro de las 96 skills de Hermes

## Tecnologías

- **Backend**: Node.js, Express, better-sqlite3
- **Frontend**: React 18, Vite, react-leaflet, Leaflet
- **Base de datos**: SQLite (3 bases de datos separadas)
- **Estilos**: CSS custom properties (tema oscuro/claro)

## Autor

Yadok — https://programacion-ia.blogspot.com
