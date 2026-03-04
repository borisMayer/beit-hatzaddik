export default function DashboardPage() {
  return (
    <div className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <span className="font-cinzel text-xs tracking-[0.4em] text-[#7a6230]">BEIT HATZADDIK</span>
        <h1 className="font-cinzel text-3xl text-[#C9A84C] mt-2 tracking-widest">MI PROGRESO</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Cursos Activos', value: '3', icon: '📖' },
          { label: 'Lecciones Completadas', value: '24', icon: '✅' },
          { label: 'Días en Comunidad', value: '47', icon: '🕊' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 border border-[#C9A84C]/15 rounded-lg bg-white/[0.02] text-center">
            <span className="text-3xl block mb-2">{stat.icon}</span>
            <div className="font-cinzel text-3xl text-[#C9A84C] mb-1">{stat.value}</div>
            <div className="text-[#F5EDD8]/50 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="border border-[#C9A84C]/15 rounded-lg p-6 bg-white/[0.02]">
        <h2 className="font-cinzel text-[#C9A84C] tracking-widest mb-4">CURSOS EN PROGRESO</h2>
        <div className="space-y-4">
          {[
            { title: 'Introducción a la Cábala Reformada', progress: 75 },
            { title: 'Psicología del Alma', progress: 40 },
            { title: 'Teología Reformada y Tradición Judía', progress: 20 },
          ].map((course) => (
            <div key={course.title}>
              <div className="flex justify-between mb-1">
                <span className="text-[#F5EDD8]/70 text-sm">{course.title}</span>
                <span className="text-[#C9A84C] text-sm font-cinzel">{course.progress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] rounded-full transition-all"
                  style={{ width: `${course.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
