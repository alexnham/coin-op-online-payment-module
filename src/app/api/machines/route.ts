import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const machines = await prisma.machine.findMany({ orderBy: { name: 'asc' } })

  const withStatus = machines.map((m: typeof machines[0]) => ({
    ...m,
    isOnline: !!m.lastSeen && m.lastSeen > new Date(Date.now() - 10_000),
  }))

  return NextResponse.json(withStatus)
}