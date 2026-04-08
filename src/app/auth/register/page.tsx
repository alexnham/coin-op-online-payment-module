 'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchMachineWithRetries } from '@/lib/machine'
export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  const router = useRouter()
  const [machineParam, setMachineParam] = useState<string | null>(null)
  useEffect(() => {
    let mounted = true
    fetchMachineWithRetries().then(m => { if (mounted) setMachineParam(m) })
    return () => { mounted = false }
  }, [])
  const preserve = machineParam ? `?machine=${encodeURIComponent(machineParam)}` : ''
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); setLoading(false); return }
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Don't send confirmPassword to the server
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    // Redirect to dashboard and show one-time welcome popup
    const joinChar = preserve ? '&' : '?'
    router.push(`/dashboard${preserve}${joinChar}welcome=1`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="card p-10 w-full max-w-sm">
        <p className="label mb-1">New Account</p>
        <h2 className="mono text-accent text-xl mb-8">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={8} />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input className="input" type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required minLength={8} />
          </div>
          {error && <p className="text-warn text-xs mono">{error}</p>}
          <button className="btn-primary w-full py-4 text-sm rounded-sm mt-2" disabled={loading}>
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </form>
        <p className="text-muted text-xs text-center mt-6">
          Already have an account?{' '}
          <Link href={`/auth/login${preserve}`} className="text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
