import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const posts = await prisma.forumPost.findMany({
      include: {
        user: { select: { name: true, image: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    return NextResponse.json(posts)
  } catch {
    return NextResponse.json({ error: 'DB not ready' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const post = await prisma.forumPost.create({
      data: {
        title: body.title,
        content: body.content,
        userId: (session.user as any).id,
        courseId: body.courseId ?? null,
      },
      include: { user: { select: { name: true, image: true } }, _count: { select: { comments: true } } }
    })
    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 })
  }
}
