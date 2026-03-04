import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment as MPPayment } from 'mercadopago'
import { prisma } from '@/lib/prisma'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN ?? '' })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (body.type !== 'payment') return NextResponse.json({ ok: true })

    const mpPayment = new MPPayment(mp)
    const paymentData = await mpPayment.get({ id: body.data.id })

    const status = paymentData.status === 'approved' ? 'APPROVED' :
                   paymentData.status === 'rejected' ? 'REJECTED' : 'PENDING'

    const meta = paymentData.metadata as any
    const { userId, courseId, type } = meta ?? {}

    // Update payment record
    await prisma.payment.updateMany({
      where: { mpPreferenceId: paymentData.preference_id ?? '' },
      data: { status, mpPaymentId: String(body.data.id) }
    })

    // If approved, grant access
    if (status === 'APPROVED') {
      if (type === 'COURSE' && courseId && userId) {
        await prisma.enrollment.upsert({
          where: { userId_courseId: { userId, courseId } },
          update: {},
          create: { userId, courseId }
        })
      } else if (type === 'SUBSCRIPTION' && userId) {
        const expires = new Date()
        expires.setMonth(expires.getMonth() + 1)
        await prisma.subscription.upsert({
          where: { userId },
          update: { status: 'ACTIVE', expiresAt: expires },
          create: { userId, amount: 29, expiresAt: expires }
        })
        // Enroll in all published courses
        const courses = await prisma.course.findMany({ where: { published: true } })
        for (const course of courses) {
          await prisma.enrollment.upsert({
            where: { userId_courseId: { userId, courseId: course.id } },
            update: {},
            create: { userId, courseId: course.id }
          })
        }
      }
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
