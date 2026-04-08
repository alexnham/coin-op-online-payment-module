import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-md w-full text-center space-y-8">

        {/* Logo */}
        <div>
          <h1 className="mono text-accent text-4xl tracking-tight mb-2">Gardenwood Laundry</h1>
          <p className="text-muted text-sm tracking-wide">Buy credits. Start your wash. No coins needed.</p>
        </div>

        {/* Features */}
        <div className="card p-6 text-left space-y-4">
          {[
            ['01', 'Create an account'],
            ['02', 'Buy a credit pack via Stripe'],
            ['03', 'Tap to start any machine'],
          ].map(([num, text]) => (
            <div key={num} className="flex items-center gap-4">
              <span className="mono text-accent text-xs">{num}</span>
              <span className="text-sm text-muted tracking-wide">{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link href="/auth/register">
            <button className="btn-primary w-full py-4 text-sm rounded-sm">
              Get Started
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="w-full py-4 text-sm text-muted hover:text-text transition-colors tracking-widest uppercase font-semibold">
              Sign In
            </button>
          </Link>
        </div>

        <p className="mono text-xs text-muted">HFNNXASP118CW01 · ESP32 · v1.0</p>
      </div>
    </main>
  )
}
