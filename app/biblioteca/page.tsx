'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

type Text = { id: string; title: string; author: string | null; category: string; language: string; description: string | null; fileUrl: string | null; createdAt: string }

const G = { gold: '#C9A84C', goldLight: '#E8C97A', goldDim: '#7a6230', ink: '#0D0B08', parchment: '#F5EDD8' }

const CATEGORIES = ['Torá', 'Talmud', 'Cábala', 'Teología Reformada', 'Psicología', 'Misticismo', 'Patrística', 'Homilética']
const LANGUAGES  = ['ES', 'HE', 'HE/ES', 'EN', 'EN/ES', 'GR', 'LA']

const catColor: Record<string, string> = {
  'Torá': '#C9A84C', 'Talmud': '#B8860B', 'Cábala': '#7B6DB5',
  'Teología Reformada': '#4A9B7F', 'Psicología': '#C47A3A',
  'Misticismo': '#9B4A7F', 'Patrística': '#6B8FA8', 'Homilética': '#7A9B4A'
}

const EMPTY_FORM = { title: '', author: '', category: 'Torá', language: 'ES', description: '', fileUrl: '' }

export default function BibliotecaPage() {
  const { data: session } = useSession()
  const isTzaddik = (session?.user as any)?.role === 'TZADDIK'

  const [texts, setTexts] = useState<Text[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('TODOS')
  const [search, setSearch] = useState('')
  const [selectedText, setSelectedText] = useState<Text | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchTexts = async () => {
    const r = await fetch('/api/biblioteca')
    if (r.ok) setTexts(await r.json())
    setLoading(false)
  }

  useEffect(() => { fetchTexts() }, [])

  const filtered = texts.filter(t => {
    const matchCat = activeCategory === 'TODOS' || t.category === activeCategory
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.author ?? '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const startEdit = (t: Text) => {
    setEditingId(t.id)
    setForm({ title: t.title, author: t.author ?? '', category: t.category, language: t.language, description: t.description ?? '', fileUrl: t.fileUrl ?? '' })
    setShowForm(true)
    setSelectedText(null)
  }

  const resetForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }

  const submitForm = async () => {
    if (!form.title.trim()) { showToast('El título es obligatorio'); return }
    setSubmitting(true)
    const url = editingId ? `/api/biblioteca/${editingId}` : '/api/biblioteca'
    const method = editingId ? 'PATCH' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (r.ok) {
      const saved = await r.json()
      if (editingId) setTexts(p => p.map(t => t.id === editingId ? saved : t))
      else setTexts(p => [saved, ...p])
      showToast(editingId ? 'Texto actualizado ✓' : 'Texto agregado ✓')
      resetForm()
    } else { const d = await r.json(); showToast(d.error ?? 'Error') }
    setSubmitting(false)
  }

  const deleteText = async (id: string) => {
    if (!confirm('¿Eliminar este texto sagrado?')) return
    const r = await fetch(`/api/biblioteca/${id}`, { method: 'DELETE' })
    if (r.ok) { setTexts(p => p.filter(t => t.id !== id)); setSelectedText(null); showToast('Texto eliminado') }
  }

  const allCategories = ['TODOS', ...CATEGORIES]

  return (
    <div style={{ minHeight: '100vh', background: G.ink, color: G.parchment, fontFamily: 'Georgia, serif' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

      {toast && <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 100, background: '#1a1608', border: '1px solid rgba(201,168,76,0.5)', color: G.gold, padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.85rem', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{toast}</div>}

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '0.85rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'rgba(245,237,216,0.3)', textDecoration: 'none' }}>← INICIO</Link>
          <span style={{ color: 'rgba(201,168,76,0.3)' }}>·</span>
          <span style={{ fontSize: '0.85rem', letterSpacing: '0.2em', color: G.gold }}>📚 BIBLIOTECA SAGRADA</span>
        </div>
        {isTzaddik && (
          <button onClick={() => { resetForm(); setShowForm(true) }}
            style={{ padding: '0.5rem 1.2rem', background: G.gold, color: G.ink, border: 'none', borderRadius: '5px', fontSize: '0.72rem', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
            + AGREGAR TEXTO
          </button>
        )}
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 53px)', position: 'relative', zIndex: 1 }}>

        {/* Sidebar */}
        <aside style={{ width: '280px', borderRight: '1px solid rgba(201,168,76,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Search */}
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título o autor..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '5px', padding: '0.55rem 0.8rem', color: G.parchment, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }} />
          </div>

          {/* Categories */}
          <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(201,168,76,0.08)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ textAlign: 'left', padding: '0.5rem 0.75rem', background: activeCategory === cat ? 'rgba(201,168,76,0.1)' : 'transparent', border: 'none', borderRadius: '5px', borderLeft: `2px solid ${activeCategory === cat ? G.gold : 'transparent'}`, color: activeCategory === cat ? G.gold : 'rgba(245,237,216,0.45)', fontSize: '0.75rem', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Georgia, serif', transition: 'all 0.15s' }}>
                {cat === 'TODOS' ? 'TODOS' : cat.toUpperCase()}
                <span style={{ float: 'right', fontSize: '0.65rem', color: 'rgba(245,237,216,0.25)' }}>
                  {cat === 'TODOS' ? texts.length : texts.filter(t => t.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* Add/Edit form */}
          {showForm && isTzaddik && (
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(201,168,76,0.1)', background: 'rgba(201,168,76,0.03)' }}>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: G.gold, marginBottom: '1rem' }}>
                {editingId ? 'EDITAR TEXTO' : 'AGREGAR TEXTO SAGRADO'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Título *"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.85rem', outline: 'none', fontFamily: 'Georgia, serif' }} />
                <input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                  placeholder="Autor"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.85rem', outline: 'none', fontFamily: 'Georgia, serif' }} />
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  style={{ background: '#1a1608', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.85rem', outline: 'none', fontFamily: 'Georgia, serif' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
                  style={{ background: '#1a1608', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.85rem', outline: 'none', fontFamily: 'Georgia, serif' }}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Descripción del texto..."
                rows={2}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.85rem', resize: 'vertical', outline: 'none', fontFamily: 'Georgia, serif', marginBottom: '0.75rem', boxSizing: 'border-box' }} />
              <input value={form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))}
                placeholder="URL del archivo o enlace externo (PDF, página web...)"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.85rem', outline: 'none', fontFamily: 'Georgia, serif', marginBottom: '0.75rem', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={submitForm} disabled={submitting}
                  style={{ padding: '0.6rem 1.5rem', background: G.gold, color: G.ink, border: 'none', borderRadius: '5px', fontSize: '0.72rem', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                  {submitting ? '...' : editingId ? 'GUARDAR CAMBIOS' : 'AGREGAR'}
                </button>
                <button onClick={resetForm}
                  style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid rgba(245,237,216,0.12)', borderRadius: '5px', color: 'rgba(245,237,216,0.4)', fontSize: '0.72rem', cursor: 'pointer' }}>CANCELAR</button>
              </div>
            </div>
          )}

          {/* Texts list + viewer */}
          <div style={{ flex: 1, display: 'flex' }}>

            {/* List */}
            <div style={{ width: selectedText ? '380px' : '100%', borderRight: selectedText ? '1px solid rgba(201,168,76,0.08)' : 'none', overflowY: 'auto', flexShrink: 0 }}>
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(245,237,216,0.3)', fontStyle: 'italic' }}>Cargando...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
                  <p style={{ color: 'rgba(245,237,216,0.3)', fontStyle: 'italic' }}>
                    {search ? 'Sin resultados para esa búsqueda' : 'No hay textos en esta categoría'}
                  </p>
                  {isTzaddik && <button onClick={() => setShowForm(true)} style={{ marginTop: '1rem', padding: '0.5rem 1.2rem', background: G.gold, color: G.ink, border: 'none', borderRadius: '5px', fontSize: '0.72rem', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>+ AGREGAR TEXTO</button>}
                </div>
              ) : filtered.map(t => {
                const color = catColor[t.category] ?? G.gold
                return (
                  <div key={t.id} onClick={() => setSelectedText(selectedText?.id === t.id ? null : t)}
                    style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: selectedText?.id === t.id ? 'rgba(201,168,76,0.05)' : 'transparent', borderLeft: `3px solid ${selectedText?.id === t.id ? color : 'transparent'}`, transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.92rem', color: selectedText?.id === t.id ? G.goldLight : G.parchment, marginBottom: '0.25rem', lineHeight: 1.35 }}>{t.title}</div>
                        {t.author && <div style={{ fontSize: '0.78rem', color: 'rgba(245,237,216,0.45)' }}>{t.author}</div>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.62rem', letterSpacing: '0.12em', padding: '0.15rem 0.55rem', borderRadius: '20px', border: `1px solid ${color}35`, color, background: `${color}10`, marginBottom: '0.3rem' }}>{t.category}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(245,237,216,0.25)' }}>{t.language}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Text viewer */}
            {selectedText && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>
                <div style={{ maxWidth: '600px' }}>
                  {/* Category badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', padding: '0.2rem 0.7rem', borderRadius: '20px', border: `1px solid ${(catColor[selectedText.category] ?? G.gold)}40`, color: catColor[selectedText.category] ?? G.gold, background: `${catColor[selectedText.category] ?? G.gold}10` }}>{selectedText.category}</span>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(245,237,216,0.3)', letterSpacing: '0.1em' }}>{selectedText.language}</span>
                    {isTzaddik && (
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => startEdit(selectedText)}
                          style={{ padding: '0.3rem 0.75rem', background: 'transparent', border: `1px solid ${G.gold}40`, borderRadius: '4px', color: G.gold, fontSize: '0.68rem', letterSpacing: '0.1em', cursor: 'pointer' }}>EDITAR</button>
                        <button onClick={() => deleteText(selectedText.id)}
                          style={{ padding: '0.3rem 0.75rem', background: 'transparent', border: '1px solid rgba(220,60,60,0.3)', borderRadius: '4px', color: 'rgba(220,60,60,0.6)', fontSize: '0.68rem', letterSpacing: '0.1em', cursor: 'pointer' }}>ELIMINAR</button>
                      </div>
                    )}
                  </div>

                  <h1 style={{ fontSize: '1.5rem', color: G.goldLight, letterSpacing: '0.06em', lineHeight: 1.3, marginBottom: '0.75rem' }}>{selectedText.title}</h1>
                  {selectedText.author && <p style={{ fontSize: '0.92rem', color: 'rgba(245,237,216,0.5)', fontStyle: 'italic', marginBottom: '1.5rem' }}>{selectedText.author}</p>}

                  {selectedText.description && (
                    <div style={{ fontSize: '0.95rem', lineHeight: 1.85, color: 'rgba(245,237,216,0.7)', whiteSpace: 'pre-wrap', marginBottom: '2rem', padding: '1.2rem', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                      {selectedText.description}
                    </div>
                  )}

                  {selectedText.fileUrl && (
                    <div style={{ marginTop: '1.5rem' }}>
                      {selectedText.fileUrl.includes('.pdf') ? (
                        <div>
                          <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: G.goldDim, marginBottom: '0.75rem' }}>DOCUMENTO</div>
                          <a href={selectedText.fileUrl} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '7px', color: G.gold, textDecoration: 'none', fontSize: '0.8rem', letterSpacing: '0.15em' }}>
                            📄 ABRIR PDF →
                          </a>
                          <iframe src={selectedText.fileUrl} style={{ width: '100%', height: '500px', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px', marginTop: '1rem' }} />
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: G.goldDim, marginBottom: '0.75rem' }}>RECURSO EXTERNO</div>
                          <a href={selectedText.fileUrl} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '7px', color: G.gold, textDecoration: 'none', fontSize: '0.8rem', letterSpacing: '0.15em' }}>
                            🔗 ABRIR ENLACE →
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {!selectedText.fileUrl && !selectedText.description && (
                    <div style={{ padding: '2rem', border: '1px dashed rgba(201,168,76,0.12)', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ color: 'rgba(245,237,216,0.3)', fontStyle: 'italic', fontSize: '0.88rem' }}>Sin contenido adicional disponible</p>
                      {isTzaddik && <button onClick={() => startEdit(selectedText)} style={{ marginTop: '0.75rem', padding: '0.4rem 1rem', background: 'transparent', border: `1px solid ${G.gold}40`, borderRadius: '5px', color: G.gold, fontSize: '0.72rem', letterSpacing: '0.12em', cursor: 'pointer' }}>+ AGREGAR CONTENIDO</button>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
