"use client"
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const res = await fetch('/api/auth/forgot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    if (res.ok) {
      setMessage('If that email exists, a reset link was created.')
    } else {
      setMessage('Error requesting reset')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="card p-10 w-full max-w-sm">
        <p className="label mb-1">Forgot Password</p>
        <h2 className="mono text-accent text-xl mb-8">Reset your password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button className="btn-primary w-full py-4 text-sm rounded-sm mt-2" disabled={loading}>{loading ? 'SENDING...' : 'SEND RESET LINK'}</button>
        </form>
        {message && <pre className="mono text-xs text-muted mt-4 whitespace-pre-wrap">{message}</pre>}
        <p className="text-muted text-xs text-center mt-6"><Link href="/auth/login" className="text-accent hover:underline">Back to sign in</Link></p>
      </div>
    </main>
  )
}
