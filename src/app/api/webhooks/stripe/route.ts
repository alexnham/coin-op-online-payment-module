import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[WEBHOOK] Invalid signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('[WEBHOOK] Event type:', event.type)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    console.log('[WEBHOOK] Session completed:', session.id)
    console.log('[WEBHOOK] Metadata:', session.metadata)
    console.log('[WEBHOOK] Payment status:', session.payment_status)

    if (session.payment_status !== 'paid') {
      console.log('[WEBHOOK] Not paid yet, skipping')
      return NextResponse.json({ received: true })
    }

    const userId = session.metadata?.userId
    const credits = session.metadata?.credits

    if (!userId || !credits) {
      console.error('[WEBHOOK] Missing metadata', session.metadata)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const updated = await prisma.purchase.updateMany({
      where: { stripeSessionId: session.id },
      data: {
        status: 'COMPLETED',
        stripePaymentId: session.payment_intent as string,
      },
    })
    console.log('[WEBHOOK] Purchase updated:', updated)

    const user = await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: parseInt(credits) } },
    })
    console.log('[WEBHOOK] Credits added, new total:', user.credits)
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    await prisma.purchase.updateMany({
      where: { stripeSessionId: session.id },
      data: { status: 'FAILED' },
    })
  }

  return NextResponse.json({ received: true })
}