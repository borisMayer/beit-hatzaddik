import { NextResponse } from 'next/server'

const SACRED_TEXTS = [
  { id: '1', title: 'Zohar — Libro del Esplendor', author: 'Rabi Shimon bar Yochai', category: 'Cábala', language: 'HE/ES', description: 'El texto central del misticismo judío' },
  { id: '2', title: 'Institución de la Religión Cristiana', author: 'Juan Calvino', category: 'Teología Reformada', language: 'ES', description: 'Obra sistemática fundamental del calvinismo' },
  { id: '3', title: 'El Hombre en Busca de Sentido', author: 'Viktor Frankl', category: 'Psicología', language: 'ES', description: 'Fundamento de la logoterapia' },
  { id: '4', title: 'Mesilat Yesharim — Camino de los Rectos', author: 'Ramchal', category: 'Misticismo', language: 'HE/ES', description: 'Guía ética y espiritual fundamental' },
  { id: '5', title: 'Pirke Avot — Ética de los Padres', author: 'Múltiples autores', category: 'Talmud', language: 'HE/ES', description: 'Sabiduría ética de los grandes maestros' },
  { id: '6', title: 'La Confesión de Westminster', author: 'Asamblea de Westminster', category: 'Teología Reformada', language: 'ES', description: 'Confesión de fe reformada clásica' },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const texts = category ? SACRED_TEXTS.filter(t => t.category === category) : SACRED_TEXTS
  return NextResponse.json(texts)
}
