import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { machineId } = await req.json()

  const machine = await prisma.machine.findUnique({ where: { id: machineId } })
  if (!machine) return NextResponse.json({ error: 'Machine not found' }, { status: 404 })

  // Check machine has been seen in the last 10 seconds
  const isOnline = machine.lastSeen && machine.lastSeen > new Date(Date.now() - 10_000)
  if (!isOnline) return NextResponse.json({ error: 'Machine is offline' }, { status: 503 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.credits < 1)
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  // Deduct credit + create cycle log + create job atomically
  const [, cycleUse] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } },
    }),
    prisma.cycleUse.create({
      data: { userId: user.id, machineId, creditsUsed: 1, success: false }, // success updated by ack
    }),
  ])

  const job = await prisma.job.create({
    data: { machineId, cycleUseId: cycleUse.id },
  })

  const updated = await prisma.user.findUnique({ where: { id: user.id }, select: { credits: true } })
  return NextResponse.json({ ok: true, jobId: job.id, creditsRemaining: updated?.credits })
}
