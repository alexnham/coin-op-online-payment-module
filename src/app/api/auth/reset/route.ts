import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()
  if (!token || !password || password.length < 8)
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const session = await prisma.session.findUnique({ where: { token } })
  if (!session || session.expiresAt < new Date())
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })

  // Invalidate all sessions for this user (including the reset token)
  await prisma.session.deleteMany({ where: { userId: user.id } })

  return NextResponse.json({ ok: true })
}
