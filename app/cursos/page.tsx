'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

type Course = { id: string; title: string; description: string; category: string; _count: { lessons: number; enrollments: number } }

export default function CursosPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(setCourses).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (session) {
      fetch('/api/enrollments').then(r => r.json()).then((data: any[]) => {
        setEnrolledIds(new Set(data.map((e: any) => e.courseId)))
      })
    }
  }, [session])

  const enroll = async (courseId: string) => {
    if (!session) { window.location.href = '/auth/signin'; return }
    setEnrolling(courseId)
    const r = await fetch('/api/enrollments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId }) })
    if (r.ok) { setEnrolledIds(p => new Set([...p, courseId])); showToast('¡Matriculado exitosamente! ✓') }
    else { const d = await r.json(); showToast(d.error ?? 'Error al matricularse') }
    setEnrolling(null)
  }

  const unenroll = async (courseId: string) => {
    setEnrolling(courseId)
    await fetch('/api/enrollments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId }) })
    setEnrolledIds(p => { const n = new Set(p); n.delete(courseId); return n })
    showToast('Matrícula cancelada')
    setEnrolling(null)
  }

  const categoryColors: Record<string, string> = {
    'Mística': '#C9A84C', 'Psicología': '#4A9B7F', 'Teología': '#7B6DB5', 'Práctica': '#C47A3A'
  }

  return (
    <div className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
      {toast && <div className="fixed top-6 right-6 z-50 bg-[#1a1608] border border-[#C9A84C]/50 text-[#C9A84C] px-5 py-3 rounded-lg text-sm font-cinzel tracking-wider shadow-xl">{toast}</div>}

      <div className="text-center mb-12">
        <Link href="/" className="font-cinzel text-xs tracking-[0.4em] text-[#7a6230] hover:text-[#C9A84C] transition-colors">← BEIT HATZADDIK</Link>
        <h1 className="font-cinzel text-3xl text-[#C9A84C] mt-2 tracking-widest">AULA VIRTUAL</h1>
        {!session && (
          <p className="text-[#F5EDD8]/40 text-sm mt-3 italic">
            <Link href="/auth/signin" className="text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors">Inicia sesión</Link> o{' '}
            <Link href="/auth/registro" className="text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors">regístrate</Link> para matricularte en cursos
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#F5EDD8]/30 italic font-cinzel">Cargando cursos...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {courses.map((course) => {
            const enrolled = enrolledIds.has(course.id)
            const color = categoryColors[course.category] ?? '#C9A84C'
            return (
              <div key={course.id} className="p-6 border border-[#C9A84C]/15 rounded-lg bg-white/[0.02] hover:border-[#C9A84C]/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 opacity-60" style={{background: color}} />
                <div className="flex justify-between items-start mb-3">
                  <span className="font-cinzel text-xs tracking-widest px-3 py-1 rounded-full" style={{background:`${color}15`, border:`1px solid ${color}30`, color}}>
                    {course.category}
                  </span>
                  {enrolled && <span className="font-cinzel text-xs tracking-widest text-[#4A9B7F]">● MATRICULADO</span>}
                </div>
                <h2 className="font-cinzel text-[#F5EDD8] text-lg mb-2 group-hover:text-[#E8C97A] transition-colors leading-snug">{course.title}</h2>
                <p className="text-[#F5EDD8]/45 text-sm leading-relaxed mb-4">{course.description}</p>
                <div className="flex justify-between items-center text-xs text-[#F5EDD8]/30 mb-4">
                  <span>{course._count.lessons} lecciones</span>
                  <span>{course._count.enrollments} estudiantes</span>
                </div>
                {enrolled ? (
                  <div className="flex gap-2">
                    <Link href={`/cursos/${course.id}`} className="flex-1 py-2 text-center bg-[#C9A84C] text-[#0D0B08] font-cinzel text-xs tracking-widest rounded hover:bg-[#E8C97A] transition-colors font-semibold">
                      CONTINUAR →
                    </Link>
                    <button onClick={() => unenroll(course.id)} disabled={enrolling === course.id}
                      className="px-3 py-2 border border-red-400/20 text-red-400/60 font-cinzel text-xs rounded hover:border-red-400/40 transition-colors disabled:opacity-50">
                      ✕
                    </button>
                  </div>
                ) : (
                  <button onClick={() => enroll(course.id)} disabled={enrolling === course.id}
                    className="w-full py-2 border border-[#C9A84C]/30 text-[#C9A84C] font-cinzel text-xs tracking-widest rounded hover:bg-[#C9A84C]/10 transition-colors disabled:opacity-50">
                    {enrolling === course.id ? 'MATRICULANDO...' : 'MATRICULARME →'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
