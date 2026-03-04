import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  const userId = searchParams.get('userId') ?? (session.user as any).id
  const isTzaddik = (session.user as any).role === 'TZADDIK'
  if (!isTzaddik && userId !== (session.user as any).id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const grades = await prisma.grade.findMany({
      where: {
        userId,
        ...(courseId ? { assignment: { courseId } } : {})
      },
      include: { assignment: { include: { course: { select: { id: true, title: true, category: true } } } } },
      orderBy: { gradedAt: 'desc' }
    })
    return NextResponse.json(grades)
  } catch { return NextResponse.json([]) }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'TZADDIK')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { assignmentId, userId, score, comment } = await req.json()
    const gradedBy = (session.user as any).id
    const grade = await prisma.grade.upsert({
      where: { assignmentId_userId: { assignmentId, userId } },
      update: { score: parseFloat(score), comment, gradedAt: new Date(), gradedBy },
      create: { assignmentId, userId, score: parseFloat(score), comment, gradedBy },
      include: { assignment: { select: { title: true, weight: true } }, user: { select: { name: true, email: true } } }
    })
    return NextResponse.json(grade)
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
