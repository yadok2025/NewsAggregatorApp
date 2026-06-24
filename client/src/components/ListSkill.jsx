import { useState, useEffect, useMemo, useCallback } from 'react'

function ListSkillApp({ darkMode, setDarkMode }) {
  const [skills, setSkills] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [skillContent, setSkillContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0) // 0 = index, 1+ = skill pages

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills')
      if (res.ok) {
        const data = await res.json()
        setSkills(data.skills || data)
        const cats = [...new Set((data.skills || data).map(s => s.category).filter(Boolean))].sort()
        setCategories(cats)
      }
    } catch {
      setSkills(getStaticSkills())
      setCategories(getStaticCategories())
    }
    setLoading(false)
  }

  const fetchSkillContent = async (skillName) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/skills/${encodeURIComponent(skillName)}`)
      if (res.ok) {
        const text = await res.text()
        setSkillContent(text)
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
    return [...result].sort((a, b) => a.name.localeCompare(b.name))
  }, [skills, selectedCategory, searchQuery])

  const openSkill = useCallback((skill) => {
    setSelectedSkill(skill)
    fetchSkillContent(skill.name)
    setPage(1)
  }, [])

  const goToIndex = useCallback(() => {
    setPage(0)
    setSelectedSkill(null)
    setSkillContent('')
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading) return

      if (page === 0) {
        // Index: press Enter to open selected skill
        if (e.key === 'Enter' && filteredSkills.length > 0) {
          openSkill(filteredSkills[0])
        }
      } else {
        // Page view
        if (e.key === 'Escape') {
          goToIndex()
        } else if (e.key === 'ArrowLeft') {
          // Go to previous skill
          const currentIndex = filteredSkills.findIndex(s => s.name === selectedSkill?.name)
          if (currentIndex > 0) {
            openSkill(filteredSkills[currentIndex - 1])
          }
        } else if (e.key === 'ArrowRight') {
          // Go to next skill
          const currentIndex = filteredSkills.findIndex(s => s.name === selectedSkill?.name)
          if (currentIndex < filteredSkills.length - 1) {
            openSkill(filteredSkills[currentIndex + 1])
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [page, selectedSkill, filteredSkills, loading, openSkill, goToIndex])

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
          <h1 className="header-title">📚 ListSkill</h1>
        </div>
        <div className="header-right">
          {page > 0 && (
            <span className="page-indicator">
              {filteredSkills.findIndex(s => s.name === selectedSkill?.name) + 1} / {filteredSkills.length}
            </span>
          )}
          <button
            className="btn-theme"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Keyboard hints */}
      {page > 0 && (
        <div className="keyboard-hints">
          <span className="hint"><kbd>←</kbd> Anterior</span>
          <span className="hint"><kbd>→</kbd> Siguiente</span>
          <span className="hint"><kbd>Esc</kbd> Índice</span>
        </div>
      )}

      {/* Main content */}
      <div className={`listskill-content ${page === 0 ? 'index-view' : 'page-view'}`}>
        {page === 0 ? (
          /* INDEX — LIBRO ABIERTO */
          <div className="book-container">
            <div className="book-header">
              <h2>Índice General</h2>
              <p className="book-subtitle">{skills.length} skills registradas en Hermes</p>
            </div>

            {/* Search */}
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar en el índice..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button className="btn-clear" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            {/* Category tabs */}
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
                  {cat}
                  <span className="cat-count">
                    {skills.filter(s => s.category === cat).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Index list */}
            <div className="index-page">
              {filteredSkills.length === 0 ? (
                <div className="empty-result">No se encontraron skills</div>
              ) : (
                filteredSkills.map((skill, i) => (
                  <div
                    key={skill.name}
                    className="index-item"
                    onClick={() => openSkill(skill)}
                  >
                    <div className="index-number">{String(i + 1).padStart(3, '0')}</div>
                    <div className="index-info">
                      <span className="index-name">{skill.name}</span>
                      <span className="index-desc">{skill.description}</span>
                    </div>
                    <span className="index-category">{skill.category || 'general'}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* PÁGINA DE SKILL — LIBRO ABIERTO */
          <div className="page-container">
            {loading ? (
              <div className="loading-page">
                <div className="book-spinner"></div>
                <p>Cargando...</p>
              </div>
            ) : selectedSkill ? (
              <div className="skill-page-open">
                {/* Breadcrumb */}
                <div className="page-breadcrumb">
                  <span onClick={goToIndex} className="breadcrumb-link">Índice</span>
                  <span className="breadcrumb-sep">›</span>
                  <span className="breadcrumb-current">{selectedSkill.name}</span>
                </div>

                {/* Page header */}
                <div className="page-header-area">
                  <div className="page-number">
                    Página {filteredSkills.findIndex(s => s.name === selectedSkill?.name) + 1}
                  </div>
                  <h2 className="page-title-skill">
                    {selectedSkill.name.replace(/-/g, ' ')}
                  </h2>
                  {selectedSkill.description && (
                    <p className="page-subtitle-desc">{selectedSkill.description}</p>
                  )}
                  <div className="page-meta-row">
                    {selectedSkill.category && (
                      <span className="meta-badge">{selectedSkill.category}</span>
                    )}
                    {selectedSkill.version && (
                      <span className="meta-badge">v{selectedSkill.version}</span>
                    )}
                    {selectedSkill.author && (
                      <span className="meta-badge">por {selectedSkill.author}</span>
                    )}
                    {selectedSkill.platforms && selectedSkill.platforms.map(p => (
                      <span key={p} className="meta-badge">{p}</span>
                    ))}
                  </div>
                </div>

                {/* Page content — rendered markdown-like */}
                <div className="page-content-area">
                  <MarkdownRenderer content={skillContent} />
                </div>

                {/* Page navigation */}
                <div className="page-nav">
                  {filteredSkills.findIndex(s => s.name === selectedSkill?.name) > 0 && (
                    <button className="nav-btn prev" onClick={() => {
                      const idx = filteredSkills.findIndex(s => s.name === selectedSkill?.name)
                      openSkill(filteredSkills[idx - 1])
                    }}>
                      ← Anterior
                    </button>
                  )}
                  <span className="nav-info">
                    {filteredSkills.findIndex(s => s.name === selectedSkill?.name) + 1} de {filteredSkills.length}
                  </span>
                  {filteredSkills.findIndex(s => s.name === selectedSkill?.name) < filteredSkills.length - 1 && (
                    <button className="nav-btn next" onClick={() => {
                      const idx = filteredSkills.findIndex(s => s.name === selectedSkill?.name)
                      openSkill(filteredSkills[idx + 1])
                    }}>
                      Siguiente →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-result">Selecciona una skill del índice</div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="listskill-footer">
        📚 ListSkill — {skills.length} skills — Usa ← → para navegar, Esc para índice
      </footer>
    </div>
  )
}

/* Simple markdown renderer */
function MarkdownRenderer({ content }) {
  if (!content) return null

  const lines = content.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Frontmatter markers
    if (line === '---') {
      i++
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="md-h4">{renderInline(line.slice(4))}</h4>)
    } else if (line.startsWith('## ')) {
      elements.push(<h3 key={i} className="md-h3">{renderInline(line.slice(3))}</h3>)
    } else if (line.startsWith('# ')) {
      elements.push(<h2 key={i} className="md-h2">{renderInline(line.slice(2))}</h2>)
    }
    // Code blocks
    else if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <div key={i} className="md-code-block">
          {lang && <div className="code-lang">{lang}</div>}
          <pre><code>{codeLines.join('\n')}</code></pre>
        </div>
      )
    }
    // List items
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push(renderInline(lines[i].slice(2)))
        i++
      }
      elements.push(
        <ul key={i} className="md-ul">
          {listItems.map((item, j) => <li key={j}>{item}</li>)}
        </ul>
      )
      continue
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      const listItems = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(renderInline(lines[i].replace(/^\d+\.\s/, '')))
        i++
      }
      elements.push(
        <ol key={i} className="md-ol">
          {listItems.map((item, j) => <li key={j}>{item}</li>)}
        </ol>
      )
      continue
    }
    // Blockquote
    else if (line.startsWith('> ')) {
      elements.push(<blockquote key={i} className="md-blockquote">{renderInline(line.slice(2))}</blockquote>)
    }
    // Empty line
    else if (line.trim() === '') {
      elements.push(<div key={i} className="md-spacer" />)
    }
    // Regular paragraph
    else {
      elements.push(<p key={i} className="md-p">{renderInline(line)}</p>)
    }

    i++
  }

  return <div className="markdown-content">{elements}</div>
}

function renderInline(text) {
  // Handle bold, italic, code, links
  const parts = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    // Inline code
    const codeMatch = remaining.match(/`([^`]+)`/)
    // Italic
    const italicMatch = remaining.match(/\*([^*]+)\*/)

    // Find earliest match
    let firstMatch = null
    let firstType = null

    if (boldMatch && (!firstMatch || boldMatch.index < firstMatch.index)) {
      firstMatch = boldMatch
      firstType = 'bold'
    }
    if (codeMatch && (!firstMatch || codeMatch.index < firstMatch.index)) {
      firstMatch = codeMatch
      firstType = 'code'
    }
    if (italicMatch && !boldMatch && (!firstMatch || italicMatch.index < firstMatch.index)) {
      firstMatch = italicMatch
      firstType = 'italic'
    }

    if (firstMatch) {
      if (firstMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, firstMatch.index)}</span>)
      }

      if (firstType === 'bold') {
        parts.push(<strong key={key++}>{firstMatch[1]}</strong>)
      } else if (firstType === 'code') {
        parts.push(<code key={key++} className="inline-code">{firstMatch[1]}</code>)
      } else if (firstType === 'italic') {
        parts.push(<em key={key++}>{firstMatch[1]}</em>)
      }

      remaining = remaining.slice(firstMatch.index + firstMatch[0].length)
    } else {
      parts.push(<span key={key++}>{remaining}</span>)
      break
    }
  }

  return <>{parts}</>
}

// Static fallback data
function getStaticSkills() {
  return [
    { name: "claude-code", description: "Delegate coding to Claude Code CLI (features, PRs).", category: "autonomous-ai-agents" },
    { name: "codex", description: "Delegate coding to OpenAI Codex CLI (features, PRs).", category: "autonomous-ai-agents" },
    { name: "hermes-agent", description: "Configure, extend, or contribute to Hermes Agent.", category: "autonomous-ai-agents" },
    { name: "opencode", description: "Delegate coding to OpenCode CLI (features, PR review).", category: "autonomous-ai-agents" },
    { name: "architecture-diagram", description: "Dark-themed SVG architecture/cloud/infra diagrams as HTML.", category: "creative" },
    { name: "ascii-art", description: "ASCII art: pyfiglet, cowsay, boxes, image-to-ascii.", category: "creative" },
    { name: "blog-style-yadok", description: "Guía de estilo personal de Yadok para redactar posts de blog.", category: "creative" },
    { name: "blog-topic-intelligence", description: "Encuentra temas para el próximo post analizando snapshots.", category: "creative" },
    { name: "free-image-gen", description: "Genera, descarga y monta imágenes gratuitas sin registro.", category: "creative" },
    { name: "github-repo-sync", description: "Sube o actualiza un repositorio Git en GitHub correctamente.", category: "github" },
    { name: "github-auth", description: "GitHub auth setup: HTTPS tokens, SSH keys, gh CLI login.", category: "github" },
    { name: "github-code-review", description: "Review PRs: diffs, inline comments via gh or REST.", category: "github" },
    { name: "hermes-memory-system", description: "Sistema de memoria jerárquica de 3 capas con SQLite.", category: "productivity" },
    { name: "maps", description: "Geocode, POIs, routes, timezones via OpenStreetMap/OSRM.", category: "productivity" },
    { name: "smart-model-router", description: "Auto-select the best free LLM model based on task type.", category: "productivity" },
    { name: "tech-pulse-intelligence", description: "Tendencias de la comunidad tech, noticias IA, open source.", category: "research" },
    { name: "world-news-intelligence", description: "Noticias mundiales, eventos globales, titulares.", category: "research" },
    { name: "newsaggregator-app", description: "Guía del proyecto NewsAggregatorApp.", category: "software-development" },
    { name: "plan", description: "Plan mode: write an actionable markdown plan.", category: "software-development" },
    { name: "systematic-debugging", description: "4-phase root cause debugging.", category: "software-development" },
  ]
}

function getStaticCategories() {
  return [...new Set(getStaticSkills().map(s => s.category))].sort()
}

export default ListSkillApp
