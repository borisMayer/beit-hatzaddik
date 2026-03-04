import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(201,168,76,0.07)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <span className="text-5xl mb-6 block" style={{filter:'drop-shadow(0 0 16px rgba(201,168,76,0.6))'}}>✡</span>
        
        <h1 className="font-cinzel text-4xl md:text-6xl font-bold text-[#C9A84C] tracking-widest mb-2">
          BEIT HATZADDIK
        </h1>
        <p className="font-cinzel text-sm tracking-[0.4em] text-[#F5EDD8]/50 mb-6">
          SEMINARIO VIRTUAL DE FORMACIÓN ESPIRITUAL
        </p>
        <p className="text-[#F5EDD8]/70 text-lg italic leading-relaxed mb-10">
          Un espacio de encuentro entre la sabiduría de la Torá, la teología reformada<br />
          y la profundidad del alma humana.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/cursos" className="px-8 py-3 bg-[#C9A84C] text-[#0D0B08] font-cinzel font-semibold tracking-widest text-sm rounded hover:bg-[#E8C97A] transition-colors">
            VER CURSOS
          </Link>
          <Link href="/biblioteca" className="px-8 py-3 border border-[#C9A84C]/40 text-[#C9A84C] font-cinzel tracking-widest text-sm rounded hover:border-[#C9A84C] transition-colors">
            BIBLIOTECA SAGRADA
          </Link>
          <Link href="/comunidad" className="px-8 py-3 border border-[#F5EDD8]/20 text-[#F5EDD8]/60 font-cinzel tracking-widest text-sm rounded hover:border-[#F5EDD8]/40 transition-colors">
            COMUNIDAD
          </Link>
        </div>
      </div>

      {/* Nav modules */}
      <div className="relative z-10 mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
        {[
          { icon: '📖', title: 'Aula Virtual', desc: 'Cursos y lecciones estructuradas', href: '/cursos' },
          { icon: '📚', title: 'Biblioteca', desc: 'Textos sagrados y comentarios', href: '/biblioteca' },
          { icon: '🕊', title: 'Comunidad', desc: 'Foro de discusión espiritual', href: '/comunidad' },
          { icon: '🎓', title: 'Mi Progreso', desc: 'Seguimiento académico', href: '/dashboard' },
        ].map((item) => (
          <Link key={item.title} href={item.href}
            className="group p-5 border border-[#C9A84C]/15 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#C9A84C]/35 transition-all">
            <span className="text-2xl block mb-2">{item.icon}</span>
            <div className="font-cinzel text-xs tracking-widest text-[#E8C97A] mb-1">{item.title}</div>
            <div className="text-xs text-[#F5EDD8]/50">{item.desc}</div>
          </Link>
        ))}
      </div>
    </main>
  )
}
