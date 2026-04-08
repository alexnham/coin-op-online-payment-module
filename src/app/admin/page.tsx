 'use client'
import { useEffect, useState } from 'react'
import { fetchMachineWithRetries } from '@/lib/machine'
import Link from 'next/link'
export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const [machineParam, setMachineParam] = useState<string | null>(null)
  useEffect(() => {
    let mounted = true
    fetchMachineWithRetries().then(m => { if (mounted) setMachineParam(m) })
    return () => { mounted = false }
  }, [])
  const preserve = machineParam ? `?machine=${encodeURIComponent(machineParam)}` : ''
  const [data, setData] = useState<any>(null)
  const [newMachine, setNewMachine] = useState({ name: '', location: '' })
  const [newKey, setNewKey] = useState<string | null>(null) // shown once after creation
  const [adding, setAdding] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/stats')
    if (res.status === 403) { window.location.href = '/dashboard'; return }
    setData(await res.json())
  }

  useEffect(() => { load() }, [])

  async function addMachine() {
    setAdding(true)
    const res = await fetch('/api/admin/machines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMachine),
    })
    const data = await res.json()
    setNewKey(data.apiKey) // show apiKey once
    setNewMachine({ name: '', location: '' })
    setAdding(false)
    load()
  }

  async function deleteMachine(id: string) {
    if (!confirm('Delete this machine?')) return
    await fetch('/api/admin/machines', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  if (!data) return <main className="min-h-screen flex items-center justify-center"><div className="pulse-dot" /></main>

  const { stats, machines, recentPurchases, recentCycles } = data

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="label">Admin Panel</p>
          <h1 className="mono text-accent text-2xl">LaundryBox</h1>
        </div>
        <Link href={`/dashboard${preserve}`} className="mono text-muted text-xs hover:text-accent transition-colors">← DASHBOARD</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Users', val: stats.totalUsers },
          { label: 'Revenue', val: `$${(stats.totalRevenue / 100).toFixed(2)}` },
          { label: 'Credits Sold', val: stats.totalCredits },
          { label: 'Cycles Run', val: stats.totalCycles },
        ].map(s => (
          <div key={s.label} className="card p-5 text-center">
            <p className="mono text-accent text-2xl font-bold">{s.val}</p>
            <p className="label mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Machines */}
      <div className="card p-6 mb-6">
        <p className="label mb-4">Machines</p>
        {/* Machine list */}
        <div className="space-y-2 mb-6">
          {machines.map((m: any) => (
            <div key={m.id} className="py-3 border-b border-border last:border-0">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm">{m.name}</span>
                  <span className="mono text-muted text-xs ml-3">{m.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`mono text-xs ${m.isOnline ? 'text-accent' : 'text-warn'}`}>
                    {m.isOnline ? '● ONLINE' : '○ OFFLINE'}
                  </span>
                  <span className="mono text-xs text-muted">{m._count.cycleUses} cycles</span>
                  <button onClick={() => deleteMachine(m.id)} className="mono text-xs text-warn hover:underline">DELETE</button>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="label">MACHINE NAME</span>
                <span className="mono text-xs text-muted">{m.name}</span>
                <button onClick={() => navigator.clipboard.writeText(m.name)}
                  className="mono text-xs text-accent hover:underline">COPY</button>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="label">API KEY</span>
                <span className="mono text-xs text-muted">{m.apiKey}</span>
                <button onClick={() => navigator.clipboard.writeText(m.apiKey)}
                  className="mono text-xs text-accent hover:underline">COPY</button>
              </div>
            </div>
          ))}
          {machines.length === 0 && <p className="mono text-muted text-xs">No machines yet.</p>}
        </div>

        {/* New key banner */}
        {newKey && (
          <div className="card p-4 mb-4 border-accent">
            <p className="label mb-1">New Machine API Key — copy this now!</p>
            <div className="flex items-center gap-3">
              <span className="mono text-accent text-xs break-all">{newKey}</span>
              <button onClick={() => { navigator.clipboard.writeText(newKey); setNewKey(null) }}
                className="btn-primary px-3 py-1 text-xs rounded-sm shrink-0">COPY & CLOSE</button>
            </div>
          </div>
        )}

        {/* Add machine */}
        <p className="label mb-3">Add Machine</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input className="input" placeholder="Name (e.g. Washer 1)" value={newMachine.name} onChange={e => setNewMachine({...newMachine, name: e.target.value})} />
          <input className="input" placeholder="Location (e.g. Room 101)" value={newMachine.location} onChange={e => setNewMachine({...newMachine, location: e.target.value})} />
        </div>
        <button className="btn-primary px-6 py-3 text-xs rounded-sm" onClick={addMachine} disabled={adding || !newMachine.name}>
          {adding ? 'ADDING...' : 'ADD MACHINE'}
        </button>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6">
          <p className="label mb-4">Recent Purchases</p>
          <div className="space-y-2">
            {recentPurchases.map((p: any) => (
              <div key={p.id} className="flex justify-between text-xs py-1 border-b border-border last:border-0">
                <span className="text-muted">{p.user.email}</span>
                <span className="mono text-accent">+{p.creditsAdded}cr · ${(p.amount/100).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <p className="label mb-4">Recent Cycles</p>
          <div className="space-y-2">
            {recentCycles.map((c: any) => (
              <div key={c.id} className="flex justify-between text-xs py-1 border-b border-border last:border-0">
                <span className="text-muted">{c.user.email}</span>
                <span className={`mono ${c.success ? 'text-accent' : 'text-warn'}`}>{c.machine.name} · {c.success ? 'OK' : 'FAIL'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
