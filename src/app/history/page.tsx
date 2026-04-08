 'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchMachineWithRetries } from '@/lib/machine'
export const dynamic = 'force-dynamic'

export default function HistoryPage() {
  const [machineParam, setMachineParam] = useState<string | null>(null)
  useEffect(() => {
    let mounted = true
    fetchMachineWithRetries().then(m => { if (mounted) setMachineParam(m) })
    return () => { mounted = false }
  }, [])
  const preserve = machineParam ? `?machine=${encodeURIComponent(machineParam)}` : ''
  const [purchases, setPurchases] = useState<any[]>([])
  const [cycles, setCycles] = useState<any[]>([])
  const [tab, setTab] = useState<'purchases' | 'cycles'>('purchases')

  useEffect(() => {
    fetch('/api/credits/history').then(r => r.json()).then(d => {
      setPurchases(d.purchases || [])
      setCycles(d.cycles || [])
    })
  }, [])

  return (
    <main className="min-h-screen px-6 py-10 max-w-lg mx-auto">
      <div className="mb-8">
        <Link href={`/dashboard${preserve}`} className="mono text-muted text-xs hover:text-accent transition-colors">← BACK</Link>
        <h1 className="mono text-accent text-2xl mt-4">History</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-border pb-3">
        {(['purchases', 'cycles'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`mono text-xs uppercase tracking-widest pb-1 transition-colors ${tab === t ? 'text-accent border-b border-accent' : 'text-muted hover:text-text'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'purchases' && (
        <div className="space-y-3">
          {purchases.length === 0 && <p className="mono text-muted text-xs text-center py-8">NO PURCHASES YET</p>}
          {purchases.map((p: any) => (
            <div key={p.id} className="card p-5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">+{p.creditsAdded} Credits</p>
                <p className="mono text-muted text-xs mt-1">{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="mono text-accent">${(p.amount / 100).toFixed(2)}</p>
                <p className={`mono text-xs mt-1 ${p.status === 'COMPLETED' ? 'text-accent' : 'text-warn'}`}>{p.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'cycles' && (
        <div className="space-y-3">
          {cycles.length === 0 && <p className="mono text-muted text-xs text-center py-8">NO CYCLES YET</p>}
          {cycles.map((c: any) => (
            <div key={c.id} className="card p-5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{c.machine?.name || 'Unknown Machine'}</p>
                <p className="mono text-muted text-xs mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="mono text-muted text-xs">-{c.creditsUsed} credit</p>
                <p className={`mono text-xs mt-1 ${c.success ? 'text-accent' : 'text-warn'}`}>
                  {c.success ? 'OK' : 'FAILED'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
