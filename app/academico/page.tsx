'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const G = { gold: '#C9A84C', goldLight: '#E8C97A', goldDim: '#7a6230', ink: '#0D0B08', parchment: '#F5EDD8', green: '#4A9B7F', red: '#E05555', purple: '#7B6DB5' }

const TYPE_ICON: Record<string, string> = { trabajo: '📝', examen: '📋', foro: '💬', proyecto: '🏛', quiz: '⚡' }
const TYPE_LABEL: Record<string, string> = { trabajo: 'Trabajo escrito', examen: 'Examen', foro: 'Participación foro', proyecto: 'Proyecto final', quiz: 'Quiz' }

const scoreColor = (s: number) => s >= 90 ? G.green : s >= 70 ? G.gold : s >= 50 ? '#C47A3A' : G.red
const scoreLabel = (s: number) => s >= 90 ? 'Excelente' : s >= 70 ? 'Bueno' : s >= 50 ? 'Suficiente' : 'Insuficiente'

type Course = { id: string; title: string; category: string }
type Assignment = { id: string; courseId: string; title: string; description: string | null; type: string; weight: number; dueDate: string | null; _count: { submissions: number; grades: number } }
type Grade = { id: string; assignmentId: string; score: number; comment: string | null; gradedAt: string; assignment: { title: string; weight: number; course: { id: string; title: string; category: string } } }
type Submission = { id: string; assignmentId: string; fileUrl: string | null; content: string | null; submittedAt: string; feedback: string | null; feedbackAt: string | null; assignment: { title: string; type: string; weight: number }; user?: { id: string; name: string | null; email: string } }
type Student = { id: string; name: string | null; email: string; role: string }

export default function AcademicoPage() {
  const { data: session, status } = useSession()
  const isTzaddik = (session?.user as any)?.role === 'TZADDIK'
  const userId = (session?.user as any)?.id

  const [tab, setTab] = useState<'notas' | 'tareas' | 'admin-notas' | 'admin-tareas' | 'admin-alumnos'>('notas')
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [studentGrades, setStudentGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  // Forms
  const [submitForm, setSubmitForm] = useState<{ assignmentId: string; fileUrl: string; content: string } | null>(null)
  const [feedbackForm, setFeedbackForm] = useState<{ submissionId: string; feedback: string } | null>(null)
  const [gradeForm, setGradeForm] = useState<{ assignmentId: string; userId: string; score: string; comment: string } | null>(null)
  const [assignForm, setAssignForm] = useState<{ courseId: string; title: string; description: string; type: string; weight: string; dueDate: string } | null>(null)

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/enrollments').then(r => r.json()).then(enr => {
      const c = enr.map((e: any) => e.course)
      setCourses(c)
      if (c.length > 0) setSelectedCourse(c[0].id)
    })
    if (isTzaddik) {
      fetch('/api/admin/users').then(r => r.json()).then(users => setStudents(users.filter((u: any) => u.role !== 'VISITOR')))
      fetch('/api/courses').then(r => r.json()).then(cs => { if (!isTzaddik) return; setCourses(cs) })
    }
  }, [status, isTzaddik])

  useEffect(() => {
    if (!selectedCourse) return
    setLoading(true)
    Promise.all([
      fetch(`/api/assignments?courseId=${selectedCourse}`).then(r => r.json()),
      fetch(`/api/grades?courseId=${selectedCourse}${isTzaddik && selectedStudent ? `&userId=${selectedStudent}` : ''}`).then(r => r.json()),
    ]).then(([a, g]) => { setAssignments(Array.isArray(a) ? a : []); setGrades(Array.isArray(g) ? g : []); setLoading(false) })
  }, [selectedCourse, selectedStudent, isTzaddik])

  useEffect(() => {
    if (!isTzaddik || tab !== 'admin-tareas' || !selectedCourse) return
    fetch(`/api/submissions?assignmentId=${assignments[0]?.id ?? ''}`).then(r => r.json()).then(s => setSubmissions(Array.isArray(s) ? s : []))
  }, [tab, assignments, isTzaddik, selectedCourse])

  useEffect(() => {
    if (!isTzaddik || !selectedStudent) return
    fetch(`/api/grades?userId=${selectedStudent}`).then(r => r.json()).then(g => setStudentGrades(Array.isArray(g) ? g : []))
  }, [selectedStudent, isTzaddik])

  // Computed weighted average
  const weightedAvg = (gradesArr: Grade[], assignmentsArr: Assignment[]) => {
    let totalWeight = 0, weightedSum = 0
    gradesArr.forEach(g => {
      const a = assignmentsArr.find(a => a.id === g.assignmentId)
      if (a) { weightedSum += g.score * (a.weight / 100); totalWeight += a.weight / 100 }
    })
    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : null
  }

  const avg = selectedCourse ? weightedAvg(grades.filter(g => g.assignment.course.id === selectedCourse), assignments) : null
  const allCoursesAvg = courses.length > 0 ? (() => {
    let total = 0, count = 0
    courses.forEach(c => {
      const cGrades = grades.filter(g => g.assignment.course.id === c.id)
      const cAssigns = assignments.filter(a => a.courseId === c.id)
      const a = weightedAvg(cGrades, cAssigns)
      if (a !== null) { total += a; count++ }
    })
    return count > 0 ? Math.round((total / count) * 10) / 10 : null
  })() : null

  if (status === 'unauthenticated') return (
    <div style={{ minHeight: '100vh', background: G.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎓</div>
        <Link href="/auth/signin" style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', letterSpacing: '0.2em', padding: '0.75rem 2rem', background: G.gold, color: G.ink, borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>INICIAR SESIÓN →</Link>
      </div>
    </div>
  )

  const TABS = isTzaddik
    ? [{ id: 'admin-alumnos', label: '👥 Alumnos' }, { id: 'admin-notas', label: '📊 Notas' }, { id: 'admin-tareas', label: '📬 Entregas' }, { id: 'notas', label: '🎓 Mi Vista' }]
    : [{ id: 'notas', label: '📊 Mis Notas' }, { id: 'tareas', label: '📬 Mis Tareas' }]

  return (
    <div style={{ minHeight: '100vh', background: G.ink, color: G.parchment, fontFamily: 'Georgia, serif' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
      {toast && <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 100, background: '#1a1608', border: '1px solid rgba(201,168,76,0.5)', color: G.gold, padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.85rem' }}>{toast}</div>}

      <header style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '0.85rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'rgba(245,237,216,0.3)', textDecoration: 'none' }}>← INICIO</Link>
        <span style={{ color: 'rgba(201,168,76,0.3)' }}>·</span>
        <span style={{ fontSize: '0.85rem', letterSpacing: '0.2em', color: G.gold }}>🎓 ACADÉMICO</span>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 53px)', position: 'relative', zIndex: 1 }}>

        {/* Sidebar */}
        <aside style={{ width: '240px', borderRight: '1px solid rgba(201,168,76,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
          {/* Tabs */}
          <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
            {TABS.map((t: any) => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                style={{ width: '100%', textAlign: 'left', padding: '0.55rem 0.75rem', marginBottom: '0.2rem', background: tab === t.id ? 'rgba(201,168,76,0.1)' : 'transparent', border: 'none', borderRadius: '5px', borderLeft: `2px solid ${tab === t.id ? G.gold : 'transparent'}`, color: tab === t.id ? G.gold : 'rgba(245,237,216,0.45)', fontSize: '0.78rem', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Course selector */}
          <div style={{ padding: '0.75rem' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: G.goldDim, marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>CURSOS</div>
            {courses.map(c => (
              <button key={c.id} onClick={() => setSelectedCourse(c.id)}
                style={{ width: '100%', textAlign: 'left', padding: '0.55rem 0.75rem', marginBottom: '0.2rem', background: selectedCourse === c.id ? 'rgba(201,168,76,0.08)' : 'transparent', border: 'none', borderRadius: '5px', borderLeft: `2px solid ${selectedCourse === c.id ? G.gold : 'transparent'}`, color: selectedCourse === c.id ? G.parchment : 'rgba(245,237,216,0.4)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Georgia, serif', lineHeight: 1.3 }}>
                {c.title}
              </button>
            ))}
            {courses.length === 0 && <p style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.25)', fontStyle: 'italic', padding: '0.5rem' }}>Sin cursos</p>}
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>

          {/* ── STUDENT GRADES ── */}
          {tab === 'notas' && (
            <div style={{ maxWidth: '750px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.4rem', letterSpacing: '0.2em', color: G.gold, marginBottom: '0.25rem' }}>MIS NOTAS</h1>
                  <p style={{ color: 'rgba(245,237,216,0.4)', fontStyle: 'italic', fontSize: '0.88rem' }}>Resumen académico por curso</p>
                </div>
                {allCoursesAvg !== null && (
                  <div style={{ textAlign: 'center', padding: '1rem 1.5rem', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '10px', background: 'rgba(201,168,76,0.04)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: scoreColor(allCoursesAvg) }}>{allCoursesAvg}</div>
                    <div style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: 'rgba(245,237,216,0.35)', marginTop: '0.2rem' }}>PROMEDIO GENERAL</div>
                  </div>
                )}
              </div>

              {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(245,237,216,0.3)', fontStyle: 'italic' }}>Cargando...</div> : (
                <>
                  {/* Course average */}
                  {selectedCourse && avg !== null && (
                    <div style={{ padding: '1.2rem 1.5rem', border: `1px solid ${scoreColor(avg)}30`, borderRadius: '8px', background: `${scoreColor(avg)}06`, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: scoreColor(avg), lineHeight: 1 }}>{avg}</div>
                        <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: scoreColor(avg), marginTop: '0.2rem' }}>{scoreLabel(avg)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', color: G.parchment }}>{courses.find(c => c.id === selectedCourse)?.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.4)', marginTop: '0.2rem' }}>Promedio ponderado · {grades.filter(g => g.assignment.course.id === selectedCourse).length} evaluaciones calificadas</div>
                      </div>
                    </div>
                  )}

                  {/* Grades table */}
                  {assignments.filter(a => a.courseId === selectedCourse).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed rgba(201,168,76,0.12)', borderRadius: '8px' }}>
                      <p style={{ color: 'rgba(245,237,216,0.3)', fontStyle: 'italic' }}>Aún no hay evaluaciones en este curso</p>
                    </div>
                  ) : (
                    <div style={{ border: '1px solid rgba(201,168,76,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0.65rem 1.2rem', background: 'rgba(201,168,76,0.04)', borderBottom: '1px solid rgba(201,168,76,0.08)', fontSize: '0.6rem', letterSpacing: '0.22em', color: 'rgba(201,168,76,0.55)' }}>
                        <span>EVALUACIÓN</span><span>TIPO</span><span style={{ textAlign: 'center' }}>PESO</span><span style={{ textAlign: 'center' }}>NOTA</span>
                      </div>
                      {assignments.filter(a => a.courseId === selectedCourse).map((a, i) => {
                        const g = grades.find(g => g.assignmentId === a.id)
                        return (
                          <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', padding: '1rem 1.2rem', alignItems: 'center', borderBottom: i < assignments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                            <div>
                              <div style={{ fontSize: '0.88rem', color: G.parchment }}>{a.title}</div>
                              {a.dueDate && <div style={{ fontSize: '0.7rem', color: 'rgba(245,237,216,0.3)', marginTop: '0.1rem' }}>Entrega: {new Date(a.dueDate).toLocaleDateString('es')}</div>}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(245,237,216,0.5)' }}>{TYPE_ICON[a.type]} {TYPE_LABEL[a.type]}</div>
                            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'rgba(245,237,216,0.5)' }}>{a.weight}%</div>
                            <div style={{ textAlign: 'center' }}>
                              {g ? (
                                <div>
                                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: scoreColor(g.score) }}>{g.score}</div>
                                  {g.comment && <div style={{ fontSize: '0.68rem', color: 'rgba(245,237,216,0.35)', marginTop: '0.2rem', fontStyle: 'italic' }}>{g.comment}</div>}
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.25)', fontStyle: 'italic' }}>Pendiente</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {/* Total row */}
                      {avg !== null && (
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0.85rem 1.2rem', background: 'rgba(201,168,76,0.06)', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
                          <div style={{ fontSize: '0.78rem', letterSpacing: '0.15em', color: G.gold, gridColumn: '1/4' }}>PROMEDIO PONDERADO</div>
                          <div style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold', color: scoreColor(avg) }}>{avg}</div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── STUDENT SUBMISSIONS ── */}
          {tab === 'tareas' && !isTzaddik && (
            <div style={{ maxWidth: '700px' }}>
              <h1 style={{ fontSize: '1.4rem', letterSpacing: '0.2em', color: G.gold, marginBottom: '0.25rem' }}>MIS TAREAS</h1>
              <p style={{ color: 'rgba(245,237,216,0.4)', fontStyle: 'italic', fontSize: '0.88rem', marginBottom: '2rem' }}>Entrega tus trabajos y consulta el feedback</p>

              {assignments.filter(a => a.courseId === selectedCourse).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed rgba(201,168,76,0.12)', borderRadius: '8px' }}>
                  <p style={{ color: 'rgba(245,237,216,0.3)', fontStyle: 'italic' }}>No hay tareas asignadas en este curso</p>
                </div>
              ) : assignments.filter(a => a.courseId === selectedCourse).map(a => {
                const mySub = submissions.find(s => s.assignmentId === a.id)
                return (
                  <div key={a.id} style={{ marginBottom: '1rem', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.2rem', borderBottom: mySub || submitForm?.assignmentId === a.id ? '1px solid rgba(201,168,76,0.08)' : 'none', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '1rem' }}>{TYPE_ICON[a.type]}</span>
                          <span style={{ fontSize: '0.92rem', color: G.parchment }}>{a.title}</span>
                          <span style={{ fontSize: '0.62rem', letterSpacing: '0.1em', padding: '0.1rem 0.5rem', borderRadius: '20px', border: '1px solid rgba(201,168,76,0.2)', color: G.goldDim }}>{a.weight}%</span>
                        </div>
                        {a.description && <p style={{ fontSize: '0.82rem', color: 'rgba(245,237,216,0.5)', lineHeight: 1.6 }}>{a.description}</p>}
                        {a.dueDate && <p style={{ fontSize: '0.72rem', color: new Date(a.dueDate) < new Date() ? G.red : 'rgba(245,237,216,0.35)', marginTop: '0.3rem' }}>📅 Entrega: {new Date(a.dueDate).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                      </div>
                      {mySub ? (
                        <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(74,155,127,0.15)', border: '1px solid rgba(74,155,127,0.3)', color: G.green, flexShrink: 0 }}>✓ ENTREGADO</span>
                      ) : (
                        <button onClick={() => setSubmitForm({ assignmentId: a.id, fileUrl: '', content: '' })}
                          style={{ padding: '0.4rem 1rem', background: G.gold, color: G.ink, border: 'none', borderRadius: '5px', fontSize: '0.7rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold', flexShrink: 0 }}>
                          ENTREGAR
                        </button>
                      )}
                    </div>

                    {/* Submit form */}
                    {submitForm?.assignmentId === a.id && !mySub && (
                      <div style={{ padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.02)' }}>
                        <input value={submitForm.fileUrl} onChange={e => setSubmitForm(p => p ? { ...p, fileUrl: e.target.value } : p)}
                          placeholder="URL del archivo (Google Drive, Dropbox, etc.)"
                          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.82rem', outline: 'none', fontFamily: 'Georgia, serif', marginBottom: '0.6rem', boxSizing: 'border-box' }} />
                        <textarea value={submitForm.content} onChange={e => setSubmitForm(p => p ? { ...p, content: e.target.value } : p)}
                          placeholder="O escribe tu trabajo directamente aquí..."
                          rows={4}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.82rem', resize: 'vertical', outline: 'none', fontFamily: 'Georgia, serif', marginBottom: '0.6rem', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={async () => {
                            const r = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignmentId: a.id, fileUrl: submitForm.fileUrl || null, content: submitForm.content || null }) })
                            if (r.ok) { const s = await r.json(); setSubmissions(p => [...p, s]); setSubmitForm(null); showToast('Trabajo entregado ✓') }
                          }} style={{ padding: '0.55rem 1.2rem', background: G.gold, color: G.ink, border: 'none', borderRadius: '5px', fontSize: '0.72rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>ENVIAR</button>
                          <button onClick={() => setSubmitForm(null)} style={{ padding: '0.55rem 0.8rem', background: 'transparent', border: '1px solid rgba(245,237,216,0.12)', borderRadius: '5px', color: 'rgba(245,237,216,0.4)', fontSize: '0.72rem', cursor: 'pointer' }}>CANCELAR</button>
                        </div>
                      </div>
                    )}

                    {/* Submitted work + feedback */}
                    {mySub && (
                      <div style={{ padding: '1rem 1.2rem', background: 'rgba(74,155,127,0.03)' }}>
                        {mySub.fileUrl && <a href={mySub.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: G.gold, textDecoration: 'none', marginBottom: '0.5rem' }}>🔗 Ver archivo entregado →</a>}
                        {mySub.content && <p style={{ fontSize: '0.82rem', color: 'rgba(245,237,216,0.5)', lineHeight: 1.6, marginBottom: '0.5rem', fontStyle: 'italic' }}>{mySub.content.substring(0, 200)}{mySub.content.length > 200 ? '...' : ''}</p>}
                        <p style={{ fontSize: '0.7rem', color: 'rgba(245,237,216,0.3)' }}>Entregado: {new Date(mySub.submittedAt).toLocaleDateString('es', { day: 'numeric', month: 'long' })}</p>
                        {mySub.feedback && (
                          <div style={{ marginTop: '0.75rem', padding: '0.85rem', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', background: 'rgba(201,168,76,0.04)' }}>
                            <div style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: G.goldDim, marginBottom: '0.4rem' }}>FEEDBACK DEL TZADDIK</div>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.7)', lineHeight: 1.7 }}>{mySub.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── ADMIN: STUDENTS VIEW ── */}
          {tab === 'admin-alumnos' && isTzaddik && (
            <div style={{ maxWidth: '900px' }}>
              <h1 style={{ fontSize: '1.4rem', letterSpacing: '0.2em', color: G.gold, marginBottom: '0.25rem' }}>GESTIÓN DE ALUMNOS</h1>
              <p style={{ color: 'rgba(245,237,216,0.4)', fontStyle: 'italic', fontSize: '0.88rem', marginBottom: '2rem' }}>Historial académico completo por alumno</p>
              <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
                <div style={{ border: '1px solid rgba(201,168,76,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
                  {students.map((s, i) => (
                    <div key={s.id} onClick={() => setSelectedStudent(s.id)}
                      style={{ padding: '0.85rem 1rem', borderBottom: i < students.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', background: selectedStudent === s.id ? 'rgba(201,168,76,0.08)' : 'transparent', borderLeft: `2px solid ${selectedStudent === s.id ? G.gold : 'transparent'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: G.gold, flexShrink: 0 }}>{s.name?.[0]?.toUpperCase() ?? '?'}</div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: G.parchment }}>{s.name ?? 'Sin nombre'}</div>
                          <div style={{ fontSize: '0.68rem', color: 'rgba(245,237,216,0.35)' }}>{s.email}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  {selectedStudent ? (
                    <div>
                      <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: G.goldDim, marginBottom: '1rem' }}>HISTORIAL DE NOTAS</div>
                      {studentGrades.length === 0 ? (
                        <p style={{ color: 'rgba(245,237,216,0.3)', fontStyle: 'italic' }}>Sin notas registradas</p>
                      ) : (
                        <div style={{ border: '1px solid rgba(201,168,76,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
                          {studentGrades.map((g, i) => (
                            <div key={g.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', padding: '0.85rem 1.2rem', borderBottom: i < studentGrades.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '0.85rem', color: G.parchment }}>{g.assignment.title}</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(245,237,216,0.35)' }}>{g.assignment.course.title}</div>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'rgba(245,237,216,0.45)' }}>{g.assignment.weight}%</div>
                              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: scoreColor(g.score), textAlign: 'right' }}>{g.score}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : <p style={{ color: 'rgba(245,237,216,0.3)', fontStyle: 'italic' }}>Selecciona un alumno</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── ADMIN: GRADE MANAGEMENT ── */}
          {tab === 'admin-notas' && isTzaddik && (
            <div style={{ maxWidth: '900px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.4rem', letterSpacing: '0.2em', color: G.gold, marginBottom: '0.25rem' }}>GESTIÓN DE NOTAS</h1>
                  <p style={{ color: 'rgba(245,237,216,0.4)', fontStyle: 'italic', fontSize: '0.88rem' }}>Evaluaciones y calificaciones por curso</p>
                </div>
                <button onClick={() => setAssignForm({ courseId: selectedCourse ?? '', title: '', description: '', type: 'trabajo', weight: '20', dueDate: '' })}
                  style={{ padding: '0.5rem 1.2rem', background: G.gold, color: G.ink, border: 'none', borderRadius: '5px', fontSize: '0.72rem', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                  + NUEVA EVALUACIÓN
                </button>
              </div>

              {/* New assignment form */}
              {assignForm && (
                <div style={{ padding: '1.2rem', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', background: 'rgba(201,168,76,0.03)', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: G.gold, marginBottom: '0.75rem' }}>NUEVA EVALUACIÓN</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <input value={assignForm.title} onChange={e => setAssignForm(p => p ? { ...p, title: e.target.value } : p)} placeholder="Nombre de la evaluación *"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.82rem', outline: 'none', fontFamily: 'Georgia, serif' }} />
                    <select value={assignForm.type} onChange={e => setAssignForm(p => p ? { ...p, type: e.target.value } : p)}
                      style={{ background: '#1a1608', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.82rem', outline: 'none', fontFamily: 'Georgia, serif' }}>
                      {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <input value={assignForm.weight} onChange={e => setAssignForm(p => p ? { ...p, weight: e.target.value } : p)} placeholder="Peso % (ej: 30)"
                      type="number" min="0" max="100"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.82rem', outline: 'none', fontFamily: 'Georgia, serif' }} />
                    <input value={assignForm.dueDate} onChange={e => setAssignForm(p => p ? { ...p, dueDate: e.target.value } : p)} type="date"
                      style={{ background: '#1a1608', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.82rem', outline: 'none', fontFamily: 'Georgia, serif' }} />
                  </div>
                  <textarea value={assignForm.description} onChange={e => setAssignForm(p => p ? { ...p, description: e.target.value } : p)} placeholder="Instrucciones para el alumno..." rows={2}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.82rem', resize: 'none', outline: 'none', fontFamily: 'Georgia, serif', marginBottom: '0.6rem', boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={async () => {
                      const r = await fetch('/api/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...assignForm, courseId: selectedCourse }) })
                      if (r.ok) { const a = await r.json(); setAssignments(p => [...p, a]); setAssignForm(null); showToast('Evaluación creada ✓') }
                    }} style={{ padding: '0.55rem 1.2rem', background: G.gold, color: G.ink, border: 'none', borderRadius: '5px', fontSize: '0.72rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>CREAR</button>
                    <button onClick={() => setAssignForm(null)} style={{ padding: '0.55rem 0.8rem', background: 'transparent', border: '1px solid rgba(245,237,216,0.12)', borderRadius: '5px', color: 'rgba(245,237,216,0.4)', fontSize: '0.72rem', cursor: 'pointer' }}>CANCELAR</button>
                  </div>
                </div>
              )}

              {/* Assignments with grade inputs per student */}
              {assignments.filter(a => a.courseId === selectedCourse).map(a => (
                <div key={a.id} style={{ marginBottom: '1.5rem', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ padding: '0.85rem 1.2rem', background: 'rgba(201,168,76,0.04)', borderBottom: '1px solid rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{TYPE_ICON[a.type]}</span>
                      <div>
                        <div style={{ fontSize: '0.92rem', color: G.parchment }}>{a.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(245,237,216,0.4)' }}>{TYPE_LABEL[a.type]} · Peso: {a.weight}% · {a._count.submissions} entregas</div>
                      </div>
                    </div>
                    <button onClick={async () => { if (!confirm('¿Eliminar evaluación?')) return; const r = await fetch(`/api/assignments/${a.id}`, { method: 'DELETE' }); if (r.ok) { setAssignments(p => p.filter(x => x.id !== a.id)); showToast('Evaluación eliminada') } }}
                      style={{ padding: '0.25rem 0.6rem', background: 'transparent', border: '1px solid rgba(220,60,60,0.25)', borderRadius: '4px', color: 'rgba(220,60,60,0.5)', fontSize: '0.65rem', cursor: 'pointer' }}>ELIMINAR</button>
                  </div>
                  <div>
                    {students.map((s, i) => {
                      const g = grades.find(g => g.assignmentId === a.id && g.assignment.course.id === selectedCourse)
                      return (
                        <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', padding: '0.75rem 1.2rem', alignItems: 'center', borderBottom: i < students.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: G.parchment }}>{s.name ?? 'Sin nombre'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(245,237,216,0.35)' }}>{s.email}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input type="number" min="0" max="100" placeholder="0-100"
                              defaultValue={grades.find(g => g.assignmentId === a.id && g.userId === s.id)?.score ?? ''}
                              id={`grade-${a.id}-${s.id}`}
                              style={{ width: '70px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.4rem 0.6rem', color: G.parchment, fontSize: '0.85rem', outline: 'none', textAlign: 'center', fontFamily: 'Georgia, serif' }} />
                            <input placeholder="Comentario"
                              defaultValue={grades.find(g => g.assignmentId === a.id && g.userId === s.id)?.comment ?? ''}
                              id={`comment-${a.id}-${s.id}`}
                              style={{ width: '180px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.4rem 0.6rem', color: G.parchment, fontSize: '0.82rem', outline: 'none', fontFamily: 'Georgia, serif' }} />
                          </div>
                          <button onClick={async () => {
                            const scoreEl = document.getElementById(`grade-${a.id}-${s.id}`) as HTMLInputElement
                            const commentEl = document.getElementById(`comment-${a.id}-${s.id}`) as HTMLInputElement
                            const score = parseFloat(scoreEl.value)
                            if (isNaN(score) || score < 0 || score > 100) { showToast('Nota debe ser entre 0 y 100'); return }
                            const r = await fetch('/api/grades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignmentId: a.id, userId: s.id, score, comment: commentEl.value }) })
                            if (r.ok) { const ng = await r.json(); setGrades(p => { const filtered = p.filter(g => !(g.assignmentId === a.id && g.userId === s.id)); return [...filtered, ng] }); showToast(`Nota guardada: ${score} ✓`) }
                          }} style={{ padding: '0.4rem 0.85rem', background: 'rgba(74,155,127,0.15)', border: '1px solid rgba(74,155,127,0.3)', borderRadius: '5px', color: G.green, fontSize: '0.7rem', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                            GUARDAR
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ADMIN: SUBMISSIONS ── */}
          {tab === 'admin-tareas' && isTzaddik && (
            <AdminSubmissions assignments={assignments.filter(a => a.courseId === selectedCourse)} showToast={showToast} grades={grades} />
          )}
        </main>
      </div>
    </div>
  )
}

function AdminSubmissions({ assignments, showToast, grades }: { assignments: Assignment[]; showToast: (m: string) => void; grades: any[] }) {
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(assignments[0]?.id ?? null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState<{ submissionId: string; feedback: string } | null>(null)

  const G = { gold: '#C9A84C', goldLight: '#E8C97A', goldDim: '#7a6230', ink: '#0D0B08', parchment: '#F5EDD8', green: '#4A9B7F', red: '#E05555' }

  useEffect(() => {
    if (!selectedAssignment) return
    setLoading(true)
    fetch(`/api/submissions?assignmentId=${selectedAssignment}`).then(r => r.json()).then(s => { setSubmissions(Array.isArray(s) ? s : []); setLoading(false) })
  }, [selectedAssignment])

  useEffect(() => {
    if (assignments.length > 0 && !selectedAssignment) setSelectedAssignment(assignments[0].id)
  }, [assignments, selectedAssignment])

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.4rem', letterSpacing: '0.2em', color: G.gold, marginBottom: '0.25rem' }}>ENTREGAS</h1>
      <p style={{ color: 'rgba(245,237,216,0.4)', fontStyle: 'italic', fontSize: '0.88rem', marginBottom: '2rem' }}>Revisa los trabajos entregados y da feedback</p>

      {/* Assignment selector */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {assignments.map(a => (
          <button key={a.id} onClick={() => setSelectedAssignment(a.id)}
            style={{ padding: '0.45rem 1rem', background: selectedAssignment === a.id ? G.gold : 'transparent', color: selectedAssignment === a.id ? G.ink : 'rgba(245,237,216,0.5)', border: `1px solid ${selectedAssignment === a.id ? G.gold : 'rgba(201,168,76,0.2)'}`, borderRadius: '20px', fontSize: '0.75rem', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: selectedAssignment === a.id ? 'bold' : 'normal' }}>
            {TYPE_ICON[a.type]} {a.title} ({a._count.submissions})
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(245,237,216,0.3)', fontStyle: 'italic' }}>Cargando...</div> :
        submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed rgba(201,168,76,0.12)', borderRadius: '8px' }}>
            <p style={{ color: 'rgba(245,237,216,0.3)', fontStyle: 'italic' }}>No hay entregas para esta evaluación</p>
          </div>
        ) : submissions.map(sub => {
          const g = grades.find(g => g.assignmentId === sub.assignmentId && g.userId === sub.user?.id)
          return (
            <div key={sub.id} style={{ marginBottom: '1rem', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: G.gold }}>{sub.user?.name?.[0]?.toUpperCase() ?? '?'}</div>
                  <div>
                    <div style={{ fontSize: '0.88rem', color: G.parchment }}>{sub.user?.name ?? 'Sin nombre'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(245,237,216,0.35)' }}>{new Date(sub.submittedAt).toLocaleDateString('es', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                {g && <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: g.score >= 70 ? G.green : G.red }}>{g.score}</div>}
              </div>
              <div style={{ padding: '1rem 1.2rem' }}>
                {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: G.gold, textDecoration: 'none', marginBottom: '0.75rem', padding: '0.4rem 0.85rem', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '5px', background: 'rgba(201,168,76,0.05)' }}>🔗 Ver trabajo entregado →</a>}
                {sub.content && <p style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.6)', lineHeight: 1.7, marginBottom: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '5px', fontStyle: 'italic' }}>{sub.content}</p>}
                {sub.feedback ? (
                  <div style={{ padding: '0.75rem', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '6px', background: 'rgba(201,168,76,0.03)', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: G.goldDim, marginBottom: '0.3rem' }}>FEEDBACK ENVIADO</div>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.65)', lineHeight: 1.7 }}>{sub.feedback}</p>
                  </div>
                ) : null}
                {feedbackForm?.submissionId === sub.id ? (
                  <div style={{ marginTop: '0.75rem' }}>
                    <textarea value={feedbackForm.feedback} onChange={e => setFeedbackForm(p => p ? { ...p, feedback: e.target.value } : p)}
                      placeholder="Escribe tu feedback para el alumno..." rows={3}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '5px', padding: '0.6rem 0.8rem', color: G.parchment, fontSize: '0.85rem', resize: 'vertical', outline: 'none', fontFamily: 'Georgia, serif', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={async () => {
                        const r = await fetch(`/api/submissions/${sub.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedback: feedbackForm.feedback }) })
                        if (r.ok) { const updated = await r.json(); setSubmissions(p => p.map(s => s.id === sub.id ? updated : s)); setFeedbackForm(null); showToast('Feedback enviado ✓') }
                      }} style={{ padding: '0.5rem 1.1rem', background: G.gold, color: G.ink, border: 'none', borderRadius: '5px', fontSize: '0.72rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>ENVIAR FEEDBACK</button>
                      <button onClick={() => setFeedbackForm(null)} style={{ padding: '0.5rem 0.8rem', background: 'transparent', border: '1px solid rgba(245,237,216,0.12)', borderRadius: '5px', color: 'rgba(245,237,216,0.4)', fontSize: '0.72rem', cursor: 'pointer' }}>CANCELAR</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setFeedbackForm({ submissionId: sub.id, feedback: sub.feedback ?? '' })}
                    style={{ marginTop: '0.5rem', padding: '0.4rem 0.9rem', background: 'transparent', border: `1px solid ${G.gold}40`, borderRadius: '5px', color: G.gold, fontSize: '0.72rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                    {sub.feedback ? 'EDITAR FEEDBACK' : '+ DAR FEEDBACK'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}
