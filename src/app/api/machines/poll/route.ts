import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * ESP32 calls GET /api/machines/poll?key=<apiKey> every 2 seconds.
 * - Updates machine lastSeen (heartbeat)
 * - Returns the oldest PENDING job if one exists, claiming it atomically
 * - Returns { job: null } if nothing to do
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 401 })

  const machine = await prisma.machine.findUnique({ where: { apiKey: key } })
  if (!machine) return NextResponse.json({ error: 'Unknown machine' }, { status: 401 })

  // Heartbeat — mark machine online
  await prisma.machine.update({
    where: { id: machine.id },
    data: { lastSeen: new Date(), isOnline: true },
  })

  // Claim the oldest pending job atomically
  const job = await prisma.job.findFirst({
    where: { machineId: machine.id, status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
  })

  if (!job) return NextResponse.json({ job: null })

  // Mark as claimed so no double-fire
  await prisma.job.update({
    where: { id: job.id },
    data: { status: 'CLAIMED', claimedAt: new Date() },
  })

  return NextResponse.json({ job: { id: job.id } })
}
