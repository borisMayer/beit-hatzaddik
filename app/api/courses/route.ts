import { NextResponse } from 'next/server'

// Datos de ejemplo para el primer deploy
// En Fase II se conecta con PostgreSQL + Prisma
const SAMPLE_COURSES = [
  { id: '1', title: 'Introducción a la Cábala Reformada', description: 'Fundamentos del misticismo judío desde una perspectiva reformada', category: 'Mística', published: true, lessonCount: 12, enrollmentCount: 5 },
  { id: '2', title: 'Psicología del Alma: Logoterapia y Torá', description: 'Integración de Viktor Frankl con la sabiduría de la Torá', category: 'Psicología', published: true, lessonCount: 8, enrollmentCount: 3 },
  { id: '3', title: 'Teología Reformada y Tradición Judía', description: 'Diálogo entre Calvino y los grandes maestros del judaísmo', category: 'Teología', published: true, lessonCount: 16, enrollmentCount: 7 },
  { id: '4', title: 'Meditación y Contemplación Espiritual', description: 'Prácticas contemplativas basadas en la Cábala y la espiritualidad reformada', category: 'Práctica', published: true, lessonCount: 6, enrollmentCount: 4 },
]

export async function GET() {
  return NextResponse.json(SAMPLE_COURSES)
}

export async function POST(req: Request) {
  const body = await req.json()
  return NextResponse.json({ ...body, id: Date.now().toString() }, { status: 201 })
}
