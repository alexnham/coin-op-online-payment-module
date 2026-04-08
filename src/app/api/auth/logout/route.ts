import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const token = cookies().get('session')?.value
  if (token) await prisma.session.deleteMany({ where: { token } })
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('session')
  return res
}
