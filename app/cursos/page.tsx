export default function CursosPage() {
  const courses = [
    { id: 1, title: 'Introducción a la Cábala Reformada', category: 'Mística', lessons: 12, level: 'Inicial' },
    { id: 2, title: 'Psicología del Alma: Logoterapia y Torá', category: 'Psicología', lessons: 8, level: 'Intermedio' },
    { id: 3, title: 'Teología Reformada y Tradición Judía', category: 'Teología', lessons: 16, level: 'Avanzado' },
    { id: 4, title: 'Meditación y Contemplación Espiritual', category: 'Práctica', lessons: 6, level: 'Inicial' },
  ]

  return (
    <div className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <span className="font-cinzel text-xs tracking-[0.4em] text-[#7a6230]">BEIT HATZADDIK</span>
        <h1 className="font-cinzel text-3xl text-[#C9A84C] mt-2 tracking-widest">AULA VIRTUAL</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {courses.map((course) => (
          <div key={course.id} className="p-6 border border-[#C9A84C]/15 rounded-lg bg-white/[0.02] hover:border-[#C9A84C]/35 hover:bg-white/[0.04] transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-3">
              <span className="font-cinzel text-xs tracking-widest text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1 rounded-full">
                {course.category}
              </span>
              <span className="text-xs text-[#F5EDD8]/40">{course.level}</span>
            </div>
            <h2 className="font-cinzel text-[#F5EDD8] text-lg mb-2 group-hover:text-[#E8C97A] transition-colors">
              {course.title}
            </h2>
            <p className="text-[#F5EDD8]/50 text-sm">{course.lessons} lecciones</p>
            <button className="mt-4 w-full py-2 border border-[#C9A84C]/30 text-[#C9A84C] font-cinzel text-xs tracking-widest rounded hover:bg-[#C9A84C]/10 transition-colors">
              COMENZAR →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
