/**
 * Sends a start pulse to an ESP32 laundry controller.
 * The ESP32 must be on the same network or reachable via URL.
 */
export async function triggerMachinePulse(espIp: string): Promise<boolean> {
  try {
    const res = await fetch(`http://${espIp}/pulse`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5s timeout
    })
    if (!res.ok) return false
    const data = await res.json()
    return data.ok === true
  } catch {
    return false
  }
}

export async function checkMachineOnline(espIp: string): Promise<boolean> {
  try {
    const res = await fetch(`http://${espIp}/`, {
      signal: AbortSignal.timeout(3000),
    })
    return res.ok
  } catch {
    return false
  }
}

// Helpers for reading `machine` query param or cookie with retries (mobile timing fixes)
export function readMachineParam(): string | null {
  try {
    if (typeof window === 'undefined') return null
    const p = new URLSearchParams(window.location.search)
    const m = p.get('machine')
    if (m) return m
    const c = document.cookie.split('; ').find(c => c.startsWith('machine='))
    if (c) return decodeURIComponent(c.split('=')[1])
  } catch (e) {
    // ignore
  }
  return null
}

export async function fetchMachineWithRetries(maxAttempts = 6, delayMs = 120): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const v = readMachineParam()
    if (v) return v
    await new Promise((res) => setTimeout(res, delayMs))
  }
  return null
}
