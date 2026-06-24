import { useState, useEffect, useMemo } from 'react'

const API = '/api'

function ListSkillApp() {
  const [skills, setSkills] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [skillContent, setSkillContent] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0) // 0 = index, 1+ = skill pages

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const res = await fetch(`${API}/skills`)
      if (res.ok) {
        const data = await res.json()
        setSkills(data.skills || data)
        const cats = [...new Set((data.skills || data).map(s => s.category).filter(Boolean))].sort()
        setCategories(cats)
      }
    } catch {
      // Fallback: load from static data if API not available
      setSkills(getStaticSkills())
      setCategories(getStaticCategories())
    }
    setLoading(false)
  }

  const fetchSkillContent = async (skillName) => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/skills/${encodeURIComponent(skillName)}`)
      if (res.ok) {
        const data = await res.json()
        setSkillContent(data.content || data)
      } else {
        setSkillContent('# Error\nNo se pudo cargar el contenido de esta skill.')
      }
    } catch {
      setSkillContent('# Error\nNo se pudo cargar el contenido de esta skill.')
    }
    setLoading(false)
  }

  const filteredSkills = useMemo(() => {
    let result = skills
    if (selectedCategory) {
      result = result.filter(s => s.category === selectedCategory)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => a.name.localeCompare(b.name))
  }, [skills, selectedCategory, searchQuery])

  const openSkill = (skill) => {
    setSelectedSkill(skill)
    fetchSkillContent(skill.name)
    setPage(1)
  }

  const goToIndex = () => {
    setPage(0)
    setSelectedSkill(null)
    setSkillContent('')
  }

  if (darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
  }

  return (
    <div className={`listskill-app ${darkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className="listskill-header">
        <div className="header-left">
          {page > 0 && (
            <button className="btn-back" onClick={goToIndex}>
              ← Índice
            </button>
          )}
          <h1 className="header-title">
            <span className="title-icon">📚</span>
            ListSkill
          </h1>
        </div>
        <button
          className="btn-theme"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️ Claro' : '🌙 Oscuro'}
        </button>
      </header>

      {/* Main content */}
      <div className={`listskill-content ${page === 0 ? 'index-view' : 'page-view'}`}>
        {page === 0 ? (
          /* INDEX VIEW */
          <div className="index-container">
            <div className="index-intro">
              <h2>Índice de Skills</h2>
              <p className="subtitle">{skills.length} skills disponibles en Hermes</p>
            </div>

            {/* Search */}
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar skills..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="btn-clear" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            {/* Category filter */}
            <div className="category-filters">
              <button
                className={`cat-btn ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                Todas ({skills.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat} ({skills.filter(s => s.category === cat).length})
                </button>
              ))}
            </div>

            {/* Skills list */}
            <div className="skills-list">
              {filteredSkills.length === 0 ? (
                <div className="empty-result">No se encontraron skills</div>
              ) : (
                filteredSkills.map((skill, i) => (
                  <div
                    key={skill.name}
                    className="skill-index-item"
                    onClick={() => openSkill(skill)}
                  >
                    <div className="skill-number">{String(i + 1).padStart(3, '0')}</div>
                    <div className="skill-info">
                      <div className="skill-name">{skill.name}</div>
                      <div className="skill-desc">{skill.description}</div>
                    </div>
                    <div className="skill-category-badge">
                      {skill.category || 'general'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* SKILL PAGE VIEW */
          <div className="skill-page">
            {loading ? (
              <div className="loading">Cargando...</div>
            ) : selectedSkill ? (
              <>
                <div className="page-header">
                  <div className="page-breadcrumb">
                    <span onClick={goToIndex} className="breadcrumb-link">Índice</span>
                    <span className="breadcrumb-sep">›</span>
                    <span className="breadcrumb-current">{selectedSkill.name}</span>
                  </div>
                  {selectedSkill.category && (
                    <span className="page-category">{selectedSkill.category}</span>
                  )}
                </div>
                <h2 className="page-title">{selectedSkill.name}</h2>
                {selectedSkill.description && (
                  <p className="page-description">{selectedSkill.description}</p>
                )}
                <div className="page-meta">
                  {selectedSkill.version && <span className="meta-tag">v{selectedSkill.version}</span>}
                  {selectedSkill.author && <span className="meta-tag">por {selectedSkill.author}</span>}
                  {selectedSkill.platforms && selectedSkill.platforms.map(p => (
                    <span key={p} className="meta-tag">{p}</span>
                  ))}
                </div>
                <div className="page-content">
                  <pre className="skill-markdown">{skillContent}</pre>
                </div>
              </>
            ) : (
              <div className="empty-result">Selecciona una skill del índice</div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="listskill-footer">
        <span>📚 ListSkill — {skills.length} skills de Hermes</span>
      </footer>
    </div>
  )
}

// Static fallback data (subset for when API is unavailable)
function getStaticSkills() {
  return [
    { name: "claude-code", description: "Delegate coding to Claude Code CLI (features, PRs).", category: "autonomous-ai-agents" },
    { name: "codex", description: "Delegate coding to OpenAI Codex CLI (features, PRs).", category: "autonomous-ai-agents" },
    { name: "hermes-agent", description: "Configure, extend, or contribute to Hermes Agent.", category: "autonomous-ai-agents" },
    { name: "opencode", description: "Delegate coding to OpenCode CLI (features, PR review).", category: "autonomous-ai-agents" },
    { name: "architecture-diagram", description: "Dark-themed SVG architecture/cloud/infra diagrams as HTML.", category: "creative" },
    { name: "ascii-art", description: "ASCII art: pyfiglet, cowsay, boxes, image-to-ascii.", category: "creative" },
    { name: "ascii-video", description: "ASCII video: convert video/audio to colored ASCII MP4/GIF.", category: "creative" },
    { name: "blog-style-yadok", description: "Guía de estilo personal de Yadok para redactar posts de blog.", category: "creative" },
    { name: "blog-topic-intelligence", description: "Encuentra temas para el próximo post analizando snapshots.", category: "creative" },
    { name: "free-image-gen", description: "Genera, descarga y monta imágenes gratuitas sin registro.", category: "creative" },
    { name: "github-repo-sync", description: "Sube o actualiza un repositorio Git en GitHub correctamente.", category: "github" },
    { name: "github-auth", description: "GitHub auth setup: HTTPS tokens, SSH keys, gh CLI login.", category: "github" },
    { name: "github-code-review", description: "Review PRs: diffs, inline comments via gh or REST.", category: "github" },
    { name: "github-pr-workflow", description: "GitHub PR lifecycle: branch, commit, open, CI, merge.", category: "github" },
    { name: "hermes-memory-system", description: "Sistema de memoria jerárquica de 3 capas con SQLite.", category: "productivity" },
    { name: "maps", description: "Geocode, POIs, routes, timezones via OpenStreetMap/OSRM.", category: "productivity" },
    { name: "smart-model-router", description: "Auto-select the best free LLM model based on task type.", category: "productivity" },
    { name: "tech-pulse-intelligence", description: "Tendencias de la comunidad tech, noticias IA, open source.", category: "research" },
    { name: "world-news-intelligence", description: "Noticias mundiales, eventos globales, titulares.", category: "research" },
    { name: "newsaggregator-app", description: "Guía del proyecto NewsAggregatorApp.", category: "software-development" },
    { name: "plan", description: "Plan mode: write an actionable markdown plan.", category: "software-development" },
    { name: "systematic-debugging", description: "4-phase root cause debugging.", category: "software-development" },
    { name: "test-driven-development", description: "TDD: enforce RED-GREEN-REFACTOR.", category: "software-development" },
  ]
}

function getStaticCategories() {
  return [...new Set(getStaticSkills().map(s => s.category))].sort()
}

export default ListSkillApp
