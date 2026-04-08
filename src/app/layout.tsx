import type { Metadata } from 'next'
import './globals.css'
import PreserveMachine from '@/components/PreserveMachine'

export const metadata: Metadata = {
  title: 'GWLaundry',
  description: 'Pay once, wash anytime.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <PreserveMachine />
        {children}
      </body>
    </html>
  )
}
