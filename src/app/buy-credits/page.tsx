"use client"
import { useState, useEffect } from 'react'
import { fetchMachineWithRetries } from '@/lib/machine'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CREDIT_PACKAGES } from '@/lib/stripe'
export const dynamic = 'force-dynamic'

// Single unit package (client-safe copy)
const unit = CREDIT_PACKAGES[0]

export default function BuyCreditsPage() {
  const router = useRouter()
  const [machineParam, setMachineParam] = useState<string | null>(null)
  useEffect(() => {
    let mounted = true
    fetchMachineWithRetries().then(m => { if (mounted) setMachineParam(m) })
    return () => { mounted = false }
  }, [])
  const preserve = machineParam ? `?machine=${encodeURIComponent(machineParam)}` : ''
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState<number>(1)

  async function checkout() {
    setLoading('unit')
    setError('')
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: unit.id, quantity, machine: machineParam || null }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(null); return }
    window.location.href = data.url
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-lg mx-auto">
      <div className="mb-10">
        <Link href={`/dashboard${preserve}`} className="mono text-muted text-xs hover:text-accent transition-colors">← BACK</Link>
        <h1 className="mono text-accent text-2xl mt-4">Buy Credits</h1>
        <p className="text-muted text-sm mt-1">Each credit starts one wash or dry cycle.</p>
      </div>

      {error && <div className="card p-4 mb-6 text-warn mono text-xs text-center">{error.toUpperCase()}</div>}

      <div className="space-y-4">
        <div className={`card p-6 flex items-center justify-between ${unit.popular ? 'border-accent' : ''}`}>
          <div>
            <p className="font-bold text-lg">{unit.credits} Cycles / Unit</p>
            <p className="mono text-muted text-xs mt-1">{unit.label}</p>
          </div>
          <div className="text-right">
            <p className="mono text-accent text-xl font-bold">${(unit.price / 100).toFixed(2)}</p>
            <p className="mono text-muted text-xs">${((unit.price / unit.credits) / 100).toFixed(2)} / cycle</p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button className="btn-secondary px-3 py-2 text-xs" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <div className="mono">{quantity}</div>
              <button className="btn-secondary px-3 py-2 text-xs" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
            <div className="mt-3">
              <p className="mono text-accent text-lg font-bold">Total ${( (unit.price * quantity) / 100).toFixed(2)}</p>
              <button
                className="btn-primary px-5 py-2 text-xs rounded-sm mt-2"
                onClick={() => checkout()}
                disabled={loading === 'unit'}
              >
                {loading === 'unit' ? 'LOADING...' : `BUY ${unit.credits * quantity} CREDITS →`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="mono text-xs text-muted text-center mt-8">Secured by Stripe · No card stored</p>
    </main>
  )
}
