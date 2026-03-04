import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const texts = await prisma.sacredText.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(texts)
  } catch { return NextResponse.json([]) }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'TZADDIK')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { title, author, category, language, description, fileUrl, externalUrl, accessLevel } = await req.json()
    if (!title?.trim() || !category?.trim())
      return NextResponse.json({ error: 'Título y categoría requeridos' }, { status: 400 })
    const text = await prisma.sacredText.create({
      data: { title, author: author ?? null, category, language: language ?? 'ES', description: description ?? null, fileUrl: fileUrl ?? null }
    })
    return NextResponse.json(text, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
