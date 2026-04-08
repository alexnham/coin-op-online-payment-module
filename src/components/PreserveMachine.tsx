"use client"
import { useLayoutEffect } from 'react'

export default function PreserveMachine() {
  useLayoutEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const machine = params.get('machine')
      if (!machine) return
      const safe = encodeURIComponent(machine)
      const maxAge = 60 * 60 * 24 * 30
      const secure = location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `machine=${safe}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
      // remove `machine` from URL without reloading
      params.delete('machine')
      const base = window.location.pathname + (params.toString() ? `?${params.toString()}` : '') + window.location.hash
      window.history.replaceState({}, '', base)
    } catch (e) {
      // ignore
    }
  }, [])

  return null
}
