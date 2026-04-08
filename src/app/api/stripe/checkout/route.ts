import { NextRequest, NextResponse } from 'next/server'
import { stripe, CREDIT_PACKAGES } from '@/lib/stripe'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { packageId, quantity = 1, machine } = await req.json()
  const qty = Math.max(1, Number(quantity) || 1)
  // Prefer explicit machine from request body, fallback to cookie set by middleware
  const machineFromCookie = req.cookies.get('machine')?.value
  const machineValue = machine || machineFromCookie || null
  const pkg = CREDIT_PACKAGES.find(p => p.id === packageId)
  if (!pkg) return NextResponse.json({ error: 'Invalid package' }, { status: 400 })

  const priceId = process.env[pkg.priceEnv]
  if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 500 })

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const machineSuffix = machineValue ? `&machine=${encodeURIComponent(machineValue)}` : ''

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: qty }],
    metadata: {
      userId: session.user.id,
      credits: String(pkg.credits * qty),
    },
    success_url: `${baseUrl}/dashboard?payment=success${machineSuffix}`,
    cancel_url: `${baseUrl}/buy-credits?payment=cancelled${machineSuffix}`,
  })

  // Create pending purchase record
  await prisma.purchase.create({
    data: {
      userId: session.user.id,
      stripeSessionId: checkout.id,
      amount: pkg.price * qty,
      creditsAdded: pkg.credits * qty,
      status: 'PENDING',
    },
  })

  return NextResponse.json({ url: checkout.url })
}
