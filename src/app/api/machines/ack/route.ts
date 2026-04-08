import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * ESP32 calls POST /api/machines/ack after firing the relay.
 * Body: { key: string, jobId: string, success: boolean }
 *
 * - Marks job DONE or FAILED
 * - Updates the linked CycleUse success flag
 * - If failed, refunds the user's credit
 */
export async function POST(req: NextRequest) {
  const { key, jobId, success } = await req.json()
  if (!key || !jobId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const machine = await prisma.machine.findUnique({ where: { apiKey: key } })
  if (!machine) return NextResponse.json({ error: 'Unknown machine' }, { status: 401 })

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { machine: true },
  })

  if (!job || job.machineId !== machine.id)
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  // Update job status
  await prisma.job.update({
    where: { id: jobId },
    data: { status: success ? 'DONE' : 'FAILED', completedAt: new Date() },
  })

  if (job.cycleUseId) {
    if (success) {
      // Mark cycle as successful
      await prisma.cycleUse.update({
        where: { id: job.cycleUseId },
        data: { success: true },
      })
    } else {
      // Refund the user's credit
      const cycle = await prisma.cycleUse.findUnique({ where: { id: job.cycleUseId } })
      if (cycle) {
        await prisma.user.update({
          where: { id: cycle.userId },
          data: { credits: { increment: 1 } },
        })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
