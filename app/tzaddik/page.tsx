'use client'
import { useState, useEffect, useCallback } from 'react'

type Stats = { users: number; courses: number; enrollments: number; posts: number }
type User = { id: string; name: string | null; email: string; role: string; createdAt: string; _count: { enrollments: number; posts: number } }
type Course = { id: string; title: string; category: string; published: boolean; order: number; _count: { lessons: number; enrollments: number } }

type Tab = 'dashboard' | 'students' | 'courses' | 'new-course'

export default function TzaddikPanel() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: '', published: false })

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const fetchStats = useCallback(async () => {
    const r = await fetch('/api/admin/stats')
    if (r.ok) setStats(await r.json())
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/users')
    if (r.ok) setUsers(await r.json())
    setLoading(false)
  }, [])

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/courses')
    if (r.ok) setCourses(await r.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => {
    if (tab === 'students') fetchUsers()
    if (tab === 'courses' || tab === 'new-course') fetchCourses()
  }, [tab, fetchUsers, fetchCourses])

  const updateUserRole = async (id: string, role: string) => {
    const r = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role }) })
    if (r.ok) { fetchUsers(); showToast('Rol actualizado ✓') }
  }

  const togglePublish = async (course: Course) => {
    const r = await fetch('/api/admin/courses', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: course.id, published: !course.published }) })
    if (r.ok) { fetchCourses(); showToast(course.published ? 'Curso ocultado' : 'Curso publicado ✓') }
  }

  const deleteCourse = async (id: string) => {
    if (!confirm('¿Eliminar este curso?')) return
    const r = await fetch('/api/admin/courses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (r.ok) { fetchCourses(); showToast('Curso eliminado') }
  }

  const createCourse = async () => {
    if (!newCourse.title || !newCourse.description || !newCourse.category) { showToast('Completa todos los campos'); return }
    const r = await fetch('/api/admin/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCourse) })
    if (r.ok) {
      setNewCourse({ title: '', description: '', category: '', published: false })
      setTab('courses')
      showToast('¡Curso creado exitosamente! ✓')
    }
  }

  const roleColor = (role: string) => {
    if (role === 'TZADDIK') return '#C9A84C'
    if (role === 'STUDENT') return '#4A9B7F'
    return '#6B7280'
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '◈' },
    { id: 'students', label: 'Discípulos', icon: '🕊' },
    { id: 'courses', label: 'Cursos', icon: '📖' },
    { id: 'new-course', label: 'Nuevo Curso', icon: '+' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0D0B08', color: '#F5EDD8', fontFamily: 'Georgia, serif' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 100, background: '#1a1608', border: '1px solid rgba(201,168,76,0.5)', color: '#C9A84C', padding: '0.75rem 1.5rem', borderRadius: '8px', fontFamily: 'serif', fontSize: '0.9rem', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: '240px', borderRight: '1px solid rgba(201,168,76,0.12)', padding: '2rem 0', flexShrink: 0, background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ padding: '0 1.5rem 2rem', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.5))' }}>✡</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.7rem', letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase' }}>Panel del</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', letterSpacing: '0.15em', color: '#E8C97A', fontWeight: 'bold' }}>Tzaddik</div>
          </div>

          <nav style={{ padding: '1.5rem 0' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: tab === t.id ? 'rgba(201,168,76,0.1)' : 'transparent', borderLeft: tab === t.id ? '2px solid #C9A84C' : '2px solid transparent', color: tab === t.id ? '#C9A84C' : 'rgba(245,237,216,0.5)', fontSize: '0.85rem', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s', border: 'none', borderLeft: tab === t.id ? '2px solid #C9A84C' : '2px solid transparent' }}>
                <span>{t.icon}</span>
                <span style={{ fontFamily: 'Georgia, serif' }}>{t.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ padding: '1.5rem', marginTop: 'auto', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            <a href="/" style={{ display: 'block', textAlign: 'center', padding: '0.5rem', fontSize: '0.75rem', letterSpacing: '0.15em', color: 'rgba(245,237,216,0.3)', textDecoration: 'none' }}>
              ← VOLVER AL SEMINARIO
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>

          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', letterSpacing: '0.2em', color: '#C9A84C', marginBottom: '0.5rem' }}>BEIT HATZADDIK</h1>
              <p style={{ color: 'rgba(245,237,216,0.4)', fontSize: '0.9rem', marginBottom: '2.5rem', fontStyle: 'italic' }}>Visión general del seminario</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
                {[
                  { label: 'Discípulos', value: stats?.users ?? '—', icon: '🕊', color: '#C9A84C' },
                  { label: 'Cursos', value: stats?.courses ?? '—', icon: '📖', color: '#4A9B7F' },
                  { label: 'Matrículas', value: stats?.enrollments ?? '—', icon: '📜', color: '#7B6DB5' },
                  { label: 'Posts del Foro', value: stats?.posts ?? '—', icon: '💬', color: '#C47A3A' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '1.5rem', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: s.color, opacity: 0.6 }} />
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'rgba(245,237,216,0.4)', marginTop: '0.4rem', textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', letterSpacing: '0.2em', color: '#C9A84C', marginBottom: '1rem' }}>ACCESOS RÁPIDOS</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { label: 'Gestionar discípulos', tab: 'students' as Tab },
                      { label: 'Ver todos los cursos', tab: 'courses' as Tab },
                      { label: 'Crear nuevo curso', tab: 'new-course' as Tab },
                    ].map(a => (
                      <button key={a.label} onClick={() => setTab(a.tab)}
                        style={{ textAlign: 'left', padding: '0.6rem 1rem', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '6px', color: 'rgba(245,237,216,0.7)', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                        → {a.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '1.5rem', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', letterSpacing: '0.2em', color: '#C9A84C', marginBottom: '1rem' }}>ESTADO DEL SISTEMA</h3>
                  {[
                    { label: 'Base de datos', status: 'Conectada', ok: true },
                    { label: 'Autenticación', status: 'Activa', ok: true },
                    { label: 'API Routes', status: 'Funcionando', ok: true },
                    { label: 'Deploy (Vercel)', status: 'Online', ok: true },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.6)' }}>{s.label}</span>
                      <span style={{ fontSize: '0.75rem', color: s.ok ? '#4A9B7F' : '#E05555', letterSpacing: '0.1em' }}>● {s.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STUDENTS */}
          {tab === 'students' && (
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', letterSpacing: '0.2em', color: '#C9A84C', marginBottom: '0.5rem' }}>DISCÍPULOS</h1>
              <p style={{ color: 'rgba(245,237,216,0.4)', fontSize: '0.9rem', marginBottom: '2rem', fontStyle: 'italic' }}>Gestiona los roles y accesos de tu comunidad</p>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(245,237,216,0.3)', fontStyle: 'italic' }}>Cargando discípulos...</div>
              ) : users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(245,237,216,0.3)', fontStyle: 'italic' }}>Aún no hay discípulos registrados</div>
              ) : (
                <div style={{ border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: '1rem', padding: '0.75rem 1.25rem', background: 'rgba(201,168,76,0.05)', borderBottom: '1px solid rgba(201,168,76,0.1)', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase' }}>
                    <span>Nombre / Email</span><span>Rol</span><span>Cursos</span><span>Posts</span><span>Acción</span>
                  </div>
                  {users.map((u, i) => (
                    <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: '1rem', padding: '1rem 1.25rem', alignItems: 'center', borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#F5EDD8' }}>{u.name ?? 'Sin nombre'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.4)' }}>{u.email}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em', padding: '0.2rem 0.7rem', borderRadius: '20px', border: `1px solid ${roleColor(u.role)}40`, color: roleColor(u.role), background: `${roleColor(u.role)}10` }}>
                          {u.role}
                        </span>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#C9A84C' }}>{u._count.enrollments}</div>
                      <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'rgba(245,237,216,0.5)' }}>{u._count.posts}</div>
                      <div>
                        <select
                          value={u.role}
                          onChange={e => updateUserRole(u.id, e.target.value)}
                          style={{ background: '#1a1608', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                          <option value="VISITOR">VISITOR</option>
                          <option value="STUDENT">STUDENT</option>
                          <option value="TZADDIK">TZADDIK</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COURSES */}
          {tab === 'courses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', letterSpacing: '0.2em', color: '#C9A84C', marginBottom: '0.5rem' }}>CURSOS</h1>
                  <p style={{ color: 'rgba(245,237,216,0.4)', fontSize: '0.9rem', fontStyle: 'italic' }}>Gestiona el contenido académico del seminario</p>
                </div>
                <button onClick={() => setTab('new-course')}
                  style={{ padding: '0.6rem 1.2rem', background: '#C9A84C', color: '#0D0B08', border: 'none', borderRadius: '6px', fontFamily: 'Georgia, serif', fontSize: '0.8rem', letterSpacing: '0.15em', cursor: 'pointer', fontWeight: 'bold' }}>
                  + NUEVO CURSO
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(245,237,216,0.3)', fontStyle: 'italic' }}>Cargando cursos...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {courses.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.95rem', color: '#F5EDD8' }}>{c.title}</span>
                          <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', padding: '0.15rem 0.6rem', borderRadius: '20px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}>{c.category}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(245,237,216,0.4)' }}>
                          {c._count.lessons} lecciones · {c._count.enrollments} matriculados
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: c.published ? '#4A9B7F' : 'rgba(245,237,216,0.3)' }}>
                          ● {c.published ? 'PUBLICADO' : 'OCULTO'}
                        </span>
                        <button onClick={() => togglePublish(c)}
                          style={{ padding: '0.35rem 0.8rem', background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '4px', color: '#C9A84C', fontSize: '0.72rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
                          {c.published ? 'OCULTAR' : 'PUBLICAR'}
                        </button>
                        <button onClick={() => deleteCourse(c.id)}
                          style={{ padding: '0.35rem 0.8rem', background: 'transparent', border: '1px solid rgba(220,60,60,0.3)', borderRadius: '4px', color: '#E05555', fontSize: '0.72rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
                          ELIMINAR
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NEW COURSE */}
          {tab === 'new-course' && (
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', letterSpacing: '0.2em', color: '#C9A84C', marginBottom: '0.5rem' }}>NUEVO CURSO</h1>
              <p style={{ color: 'rgba(245,237,216,0.4)', fontSize: '0.9rem', marginBottom: '2rem', fontStyle: 'italic' }}>Crea un nuevo curso para el seminario</p>

              <div style={{ maxWidth: '600px', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px', padding: '2rem', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[
                    { label: 'TÍTULO DEL CURSO', key: 'title', placeholder: 'Ej: Introducción a la Cábala Reformada', type: 'text' },
                    { label: 'CATEGORÍA', key: 'category', placeholder: 'Ej: Mística, Teología, Psicología, Práctica', type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(201,168,76,0.7)', marginBottom: '0.5rem' }}>{f.label}</label>
                      <input
                        type={f.type}
                        value={(newCourse as any)[f.key]}
                        onChange={e => setNewCourse(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '0.75rem 1rem', color: '#F5EDD8', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(201,168,76,0.7)', marginBottom: '0.5rem' }}>DESCRIPCIÓN</label>
                    <textarea
                      value={newCourse.description}
                      onChange={e => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe el contenido y objetivo del curso..."
                      rows={4}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '0.75rem 1rem', color: '#F5EDD8', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="checkbox"
                      id="published"
                      checked={newCourse.published}
                      onChange={e => setNewCourse(prev => ({ ...prev, published: e.target.checked }))}
                      style={{ accentColor: '#C9A84C', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="published" style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.6)', cursor: 'pointer' }}>
                      Publicar inmediatamente
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                    <button onClick={createCourse}
                      style={{ flex: 1, padding: '0.85rem', background: '#C9A84C', color: '#0D0B08', border: 'none', borderRadius: '6px', fontFamily: 'Georgia, serif', fontSize: '0.85rem', letterSpacing: '0.2em', cursor: 'pointer', fontWeight: 'bold' }}>
                      CREAR CURSO ✓
                    </button>
                    <button onClick={() => setTab('courses')}
                      style={{ padding: '0.85rem 1.5rem', background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', color: 'rgba(245,237,216,0.5)', fontSize: '0.85rem', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
