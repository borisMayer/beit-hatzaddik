import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { type, courseId } = await req.json()
    const userId = (session.user as any).id
    const baseUrl = process.env.NEXTAUTH_URL ?? 'https://beit-hatzaddik.vercel.app'

    let title = ''
    let amount = 0
    let items: any[] = []

    if (type === 'course' && courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } })
      if (!course) return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
      if (course.isFree) return NextResponse.json({ error: 'Este curso es gratuito' }, { status: 400 })

      // Check if already paid
      const existingPayment = await prisma.payment.findFirst({
        where: { userId, courseId, status: 'approved' }
      })
      if (existingPayment) return NextResponse.json({ error: 'Ya tienes acceso a este curso' }, { status: 409 })

      title = course.title
      amount = course.price
      items = [{
        id: course.id,
        title: course.title,
        quantity: 1,
        unit_price: course.price,
        currency_id: 'USD',
      }]
    } else if (type === 'subscription') {
      title = 'Beit HaTzaddik — Suscripción Mensual'
      amount = 19.99
      items = [{
        id: 'subscription-monthly',
        title: 'Acceso completo al seminario — 1 mes',
        quantity: 1,
        unit_price: 19.99,
        currency_id: 'USD',
      }]
    } else {
      return NextResponse.json({ error: 'Tipo de pago inválido' }, { status: 400 })
    }

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: { userId, courseId: courseId ?? null, type, amount, currency: 'USD', status: 'pending' }
    })

    // Create MP preference
    const preference = new Preference(client)
    const response = await preference.create({
      body: {
        items,
        payer: { email: session.user?.email ?? '' },
        back_urls: {
          success: `${baseUrl}/pagos/success?paymentId=${payment.id}&type=${type}${courseId ? `&courseId=${courseId}` : ''}`,
          failure: `${baseUrl}/pagos/failure?paymentId=${payment.id}`,
          pending: `${baseUrl}/pagos/pending?paymentId=${payment.id}`,
        },
        auto_return: 'approved',
        external_reference: payment.id,
        metadata: { paymentId: payment.id, userId, type, courseId },
      }
    })

    return NextResponse.json({ checkoutUrl: response.init_point, paymentId: payment.id })
  } catch (err) {
    console.error('MP Error:', err)
    return NextResponse.json({ error: 'Error al crear pago' }, { status: 500 })
  }
}
