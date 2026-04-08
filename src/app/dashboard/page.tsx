"use client"
import { useEffect, useState, Suspense } from 'react'
import QRCode from 'qrcode'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchMachineWithRetries } from '@/lib/machine'
export const dynamic = 'force-dynamic'

type Machine = { id: string; name: string; location: string; isOnline: boolean }

function DashboardContent() {
  const router = useRouter()
  const [machineParam, setMachineParam] = useState<string | null>(null)
  useEffect(() => {
    let mounted = true
    fetchMachineWithRetries().then(m => { if (mounted) setMachineParam(m) })
    return () => { mounted = false }
  }, [])
  const preserve = machineParam ? `?machine=${encodeURIComponent(machineParam)}` : ''
  const [user, setUser] = useState<any>(null)
  const [machines, setMachines] = useState<Machine[]>([])
  const [firing, setFiring] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null)
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.error) { router.push(`/auth/login${preserve}`); return }
      setUser(d)
    })
    fetch('/api/machines').then(r => r.json()).then((m: Machine[]) => {
      if (machineParam) {
        // QR links use machine name for routing, so filter by name
        setMachines(m.filter(x => x.name === machineParam))
      } else {
        setMachines(m)
      }
    })
    try {
      if (typeof window !== 'undefined') {
        const q = new URLSearchParams(window.location.search)
        if (q.get('payment') === 'success') setMessage('Payment successful — credits added!')
        if (q.get('welcome') === '1') {
          setWelcomeMessage('Thank you for creating an account — sorry for the installation delay. Please text 548-888-5091 with your name, the email you signed up with, and the unit number to receive 2 free credits.')
          // remove welcome param so it only shows once
          q.delete('welcome')
          const base = window.location.pathname + (q.toString() ? `?${q.toString()}` : '') + window.location.hash
          window.history.replaceState({}, '', base)
        }
      }
    } catch (e) {}
  }, [machineParam])

  useEffect(() => {
    if (!machines || machines.length === 0) return
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const entries: Array<Promise<void>> = machines.map(async (m) => {
      try {
        // QR links should route by machine name (not apiKey)
        const url = `${origin}/dashboard?machine=${encodeURIComponent(m.name)}`
        const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 200 })
        setQrUrls(prev => ({ ...prev, [m.id]: dataUrl }))
      } catch (e) {
        // ignore
      }
    })
    Promise.all(entries)
  }, [machines])

  async function useCycle(machineId: string) {
    setFiring(machineId)
    setMessage('')
    const res = await fetch('/api/credits/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machineId }),
    })
    const data = await res.json()
    if (!res.ok) { setMessage(data.error); setFiring(null); return }
    setMessage('Cycle started!')
    setUser((u: any) => ({ ...u, credits: data.creditsRemaining }))
    setFiring(null)
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(`/${preserve}`)
  }

  if (!user) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="pulse-dot" />
    </main>
  )

  return (
    <main className="min-h-screen px-6 py-10 max-w-lg mx-auto">
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="label">GWLaundry</p>
          <h1 className="mono text-accent text-2xl">{user.name || user.email}</h1>
        </div>
        <button onClick={logout} className="text-muted text-xs mono hover:text-warn transition-colors mt-1">LOGOUT</button>
      </div>
      <div className="card p-8 mb-6 text-center">
        <p className="label mb-2">Available Credits</p>
        <p className="mono text-accent text-6xl font-bold mb-1">{user.credits}</p>
        <p className="text-muted text-xs tracking-wide">1 credit = 1 wash cycle</p>
        <Link href={`/buy-credits${preserve}`}>
          <button className="btn-primary px-8 py-3 text-xs rounded-sm mt-6">BUY MORE CREDITS</button>
        </Link>
      </div>
      {message && (
        <div className={`card p-4 mb-6 mono text-xs text-center ${message.includes('success') || message.includes('started') ? 'text-accent' : 'text-warn'}`}>
          {message.toUpperCase()}
        </div>
      )}
      {welcomeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="card p-6 max-w-md w-full">
            <p className="label mb-2">Thank you</p>
            <p className="mono mb-4 text-sm">{welcomeMessage}</p>
            <div className="flex justify-end">
              <button className="btn-primary px-4 py-2" onClick={() => setWelcomeMessage(null)}>OK</button>
            </div>
          </div>
        </div>
      )}
      <div>
        <p className="label mb-4">Machines</p>
        {machines.length === 0 && (
          <div className="card p-6 text-center text-muted text-sm mono">NO MACHINES CONFIGURED</div>
        )}
        <div className="space-y-3">
          {machines.map(m => (
            <div key={m.id} className="card p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${m.isOnline ? 'bg-accent' : 'bg-warn'}`} />
                  <span className="font-semibold text-sm">{m.name}</span>
                </div>
                <p className="mono text-muted text-xs">{m.location}</p>
                <p className={`mono text-xs mt-1 ${m.isOnline ? 'text-accent' : 'text-warn'}`}>
                  {m.isOnline ? 'ONLINE' : 'OFFLINE'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="btn-primary px-6 py-3 text-xs rounded-sm"
                  disabled={!m.isOnline || user.credits < 1 || firing === m.id}
                  onClick={() => useCycle(m.id)}
                >
                  {firing === m.id ? 'STARTING...' : 'START · 1CR'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-10 text-xs mono text-muted">
        <Link href={`/history${preserve}`} className="hover:text-accent transition-colors">PURCHASE HISTORY</Link>
        {user.role === 'ADMIN' && (
          <Link href={`/admin${preserve}`} className="hover:text-accent transition-colors">ADMIN →</Link>
        )}
      </div>
    </main>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center"><div className="pulse-dot" /></main>}>
      <DashboardContent />
    </Suspense>
  )
}