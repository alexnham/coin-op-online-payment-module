import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const [users, purchases, cycles, machines] = await Promise.all([
    prisma.user.count(),
    prisma.purchase.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true, creditsAdded: true }, _count: true }),
    prisma.cycleUse.count(),
    prisma.machine.findMany({ include: { _count: { select: { cycleUses: true } } } }),
  ])

  const recentPurchases = await prisma.purchase.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { user: { select: { name: true, email: true } } },
  })

  const recentCycles = await prisma.cycleUse.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      user: { select: { name: true, email: true } },
      machine: { select: { name: true } },
    },
  })

  return NextResponse.json({
    stats: {
      totalUsers: users,
      totalRevenue: purchases._sum.amount ?? 0,
      totalCredits: purchases._sum.creditsAdded ?? 0,
      totalPurchases: purchases._count,
      totalCycles: cycles,
    },
    machines,
    recentPurchases,
    recentCycles,
  })
}
