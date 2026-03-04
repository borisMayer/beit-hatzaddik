import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  try {
    const texts = await prisma.sacredText.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(texts)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching texts' }, { status: 500 })
  }
}
