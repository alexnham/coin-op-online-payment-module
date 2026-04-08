"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ResetPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const p = new URLSearchParams(window.location.search)
        setToken(p.get('token'))
      }
    } catch (e) {}
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!token) return setError('Missing token')
    if (password.length < 8) return setError('Password must be at least 8 characters')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Reset failed'); setLoading(false); return }
    router.push('/auth/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="card p-10 w-full max-w-sm">
        <p className="label mb-1">Reset Password</p>
        <h2 className="mono text-accent text-xl mb-8">Set a new password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">New password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} />
          </div>
          {error && <p className="text-warn text-xs mono">{error}</p>}
          <button className="btn-primary w-full py-4 text-sm rounded-sm mt-2" disabled={loading}>{loading ? 'RESETTING...' : 'RESET PASSWORD'}</button>
        </form>
        <p className="text-muted text-xs text-center mt-6"><Link href="/auth/login" className="text-accent hover:underline">Back to sign in</Link></p>
      </div>
    </main>
  )
}
