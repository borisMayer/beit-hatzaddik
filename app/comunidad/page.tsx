export default function ComunidadPage() {
  const posts = [
    { title: 'Parashá Bereshit: La Creación y el Ein Sof', author: 'Myer', comments: 7, time: 'Hace 2 días' },
    { title: '¿Cómo integrar la logoterapia con la espiritualidad judía?', author: 'Discípulo1', comments: 4, time: 'Hace 3 días' },
    { title: 'Reflexión sobre los Sefirot y la psique humana', author: 'Estudiante2', comments: 12, time: 'Hace 1 semana' },
  ]

  return (
    <div className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <span className="font-cinzel text-xs tracking-[0.4em] text-[#7a6230]">BEIT HATZADDIK</span>
        <h1 className="font-cinzel text-3xl text-[#C9A84C] mt-2 tracking-widest">COMUNIDAD</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-[#F5EDD8]/50 italic">Espacio de hevruta y discusión espiritual</p>
        <button className="font-cinzel text-xs tracking-widest px-5 py-2 bg-[#C9A84C] text-[#0D0B08] rounded hover:bg-[#E8C97A] transition-colors">
          + NUEVO POST
        </button>
      </div>

      <div className="space-y-3">
        {posts.map((post, i) => (
          <div key={i} className="p-6 border border-[#C9A84C]/15 rounded-lg bg-white/[0.02] hover:border-[#C9A84C]/30 transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-cinzel text-[#F5EDD8] group-hover:text-[#E8C97A] transition-colors mb-2">{post.title}</h3>
                <div className="flex gap-4 text-xs text-[#F5EDD8]/40">
                  <span>Por {post.author}</span>
                  <span>💬 {post.comments} comentarios</span>
                  <span>{post.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
