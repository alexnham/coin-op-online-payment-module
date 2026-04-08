 'use client'
import { useState, useEffect } from 'react'
import { fetchMachineWithRetries } from '@/lib/machine'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const [machineParam, setMachineParam] = useState<string | null>(null)
  useEffect(() => {
    let mounted = true
    fetchMachineWithRetries().then(m => { if (mounted) setMachineParam(m) })
    return () => { mounted = false }
  }, [])
  const preserve = machineParam ? `?machine=${encodeURIComponent(machineParam)}` : ''
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push(`/dashboard${preserve}`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="card p-10 w-full max-w-sm">
        <p className="label mb-1">Welcome Back</p>
        <h2 className="mono text-accent text-xl mb-8">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          {error && <p className="text-warn text-xs mono">{error}</p>}
          <button className="btn-primary w-full py-4 text-sm rounded-sm mt-2" disabled={loading}>
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
        <p className="text-muted text-xs text-center mt-6">
          No account?{' '}
          <Link href={`/auth/register${preserve}`} className="text-accent hover:underline">Register</Link>
          {' '}·{' '}
          <Link href={`/auth/forgot${preserve}`} className="text-accent hover:underline">Forgot password?</Link>
        </p>
      </div>
    </main>
  )
}
