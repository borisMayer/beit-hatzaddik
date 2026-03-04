export default function BibliotecaPage() {
  const categories = ['Torá', 'Talmud', 'Cábala', 'Teología Reformada', 'Psicología', 'Misticismo']
  const texts = [
    { title: 'Zohar — Libro del Esplendor', author: 'Rabi Shimon bar Yochai', category: 'Cábala', lang: 'HE/ES' },
    { title: 'Institución de la Religión Cristiana', author: 'Juan Calvino', category: 'Teología Reformada', lang: 'ES' },
    { title: 'El Hombre en Busca de Sentido', author: 'Viktor Frankl', category: 'Psicología', lang: 'ES' },
    { title: 'Mesilat Yesharim — Camino de los Rectos', author: 'Ramchal', category: 'Misticismo', lang: 'HE/ES' },
    { title: 'Pirke Avot — Ética de los Padres', author: 'Múltiples autores', category: 'Talmud', lang: 'HE/ES' },
    { title: 'La Confesión de Westminster', author: 'Asamblea de Westminster', category: 'Teología Reformada', lang: 'ES' },
  ]

  return (
    <div className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <span className="font-cinzel text-xs tracking-[0.4em] text-[#7a6230]">BEIT HATZADDIK</span>
        <h1 className="font-cinzel text-3xl text-[#C9A84C] mt-2 tracking-widest">BIBLIOTECA SAGRADA</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button className="font-cinzel text-xs tracking-widest px-4 py-2 bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] rounded-full">TODOS</button>
        {categories.map(cat => (
          <button key={cat} className="font-cinzel text-xs tracking-widest px-4 py-2 border border-[#F5EDD8]/10 text-[#F5EDD8]/50 rounded-full hover:border-[#C9A84C]/30 hover:text-[#C9A84C] transition-colors">
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {texts.map((text, i) => (
          <div key={i} className="flex items-center justify-between p-5 border border-[#C9A84C]/12 rounded-lg bg-white/[0.02] hover:border-[#C9A84C]/30 hover:bg-white/[0.04] transition-all cursor-pointer group">
            <div>
              <h3 className="font-cinzel text-[#F5EDD8] group-hover:text-[#E8C97A] transition-colors">{text.title}</h3>
              <p className="text-[#F5EDD8]/50 text-sm mt-1">{text.author}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <span className="font-cinzel text-xs text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1 rounded-full block mb-1">{text.category}</span>
              <span className="text-xs text-[#F5EDD8]/30">{text.lang}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
