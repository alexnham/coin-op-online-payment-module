import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [purchases, cycles] = await Promise.all([
    prisma.purchase.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.cycleUse.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { machine: { select: { name: true } } },
    }),
  ])

  return NextResponse.json({ purchases, cycles })
}
