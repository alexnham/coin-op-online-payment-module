import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendResetEmail } from '@/lib/mail'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ ok: true })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Do not reveal whether email exists
    return NextResponse.json({ ok: true })
  }

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  await prisma.session.create({ data: { userId: user.id, token, expiresAt } })

  const resetUrl = `${process.env.NEXTAUTH_URL || 'https://gwlaundry.alexnham.com'}/auth/reset?token=${token}`

  // Send reset email (or log in dev) without blocking the response
  sendResetEmail(email, resetUrl).then((r) => {
    if (r && !(r as any).ok) console.warn('[forgot] sendResetEmail returned error', r)
  }).catch((e) => {
    // eslint-disable-next-line no-console
    console.warn('[forgot] email send failed', e)
  })

  return NextResponse.json({ ok: true, resetUrl })
}
