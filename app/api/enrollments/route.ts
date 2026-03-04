import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { courseId } = await req.json()
    const enrollment = await prisma.enrollment.create({
      data: { userId: (session.user as any).id, courseId }
    })
    return NextResponse.json(enrollment, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Already enrolled or error' }, { status: 400 })
  }
}
