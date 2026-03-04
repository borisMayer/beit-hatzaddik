import { NextResponse } from 'next/server'

const SAMPLE_POSTS = [
  { id: '1', title: 'Parashá Bereshit: La Creación y el Ein Sof', content: '...', userId: '1', user: { name: 'Tzaddik', image: null }, commentCount: 7, createdAt: new Date().toISOString() },
  { id: '2', title: '¿Cómo integrar la logoterapia con la espiritualidad judía?', content: '...', userId: '2', user: { name: 'Discípulo1', image: null }, commentCount: 4, createdAt: new Date().toISOString() },
  { id: '3', title: 'Reflexión sobre los Sefirot y la psique humana', content: '...', userId: '3', user: { name: 'Estudiante2', image: null }, commentCount: 12, createdAt: new Date().toISOString() },
]

export async function GET() {
  return NextResponse.json(SAMPLE_POSTS)
}

export async function POST(req: Request) {
  const body = await req.json()
  return NextResponse.json({ ...body, id: Date.now().toString() }, { status: 201 })
}
