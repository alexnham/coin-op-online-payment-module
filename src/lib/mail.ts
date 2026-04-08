// Using Resend API only for email delivery.
// See https://resend.com/docs for API details.


async function sendViaResend({ from, to, subject, text, html }: { from: string, to: string, subject: string, text: string, html?: string }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, text, html }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`resend error: ${res.status} ${body}`)
    }
    return { ok: true }
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}
export async function sendResetEmail(to: string, resetUrl: string) {
  const from = process.env.EMAIL_FROM || `no-reply@${process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, '') || 'localhost'}`

  const subject = 'Reset your GWLaundry password'
  const text = `Reset your password using this link: ${resetUrl}\n\nIf you didn't request this, ignore this email.`
  const html = `<p>Reset your password using this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, ignore this email.</p>`

  if (!process.env.RESEND_API_KEY) {
    // Dev fallback: log the URL
    // eslint-disable-next-line no-console
    console.log('[mail] RESEND_API_KEY not configured, reset link:', resetUrl)
    return { ok: true, debug: true }
  }

  try {
    await sendViaResend({ from, to, subject, text, html })
    return { ok: true }
  } catch (err) {
    console.error('[mail] sendResetEmail (resend) failed', err)
    return { ok: false, error: String(err) }
  }
}

export async function sendWelcomeEmail(to: string, name?: string) {
  const from = process.env.EMAIL_FROM || `no-reply@${process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, '') || 'localhost'}`

  const bodyText = `Thank you for signing up, ${name || ''}!\n\nSorry for the delay getting back to you. To receive 2 free credits, please reach out to 548-888-5091 and provide your name, the email you signed up with, and the unit number.`

  if (!process.env.RESEND_API_KEY) {
    // Dev fallback: log the message
    // eslint-disable-next-line no-console
    console.log('[mail] RESEND_API_KEY not configured, welcome message for:', to, bodyText)
    return { ok: true, debug: true }
  }

  try {
    const subject = 'Welcome to LaundryBox — thank you'
    const html = `<p>Thank you for signing up${name ? `, ${name}` : ''}!</p><p>Sorry for the delay getting back to you.</p><p>To receive <strong>2 free credits</strong>, please reach out to <strong>548-888-5091</strong> and provide your name, the email you signed up with, and the unit number.</p>`
    await sendViaResend({ from, to, subject, text: bodyText, html })
    return { ok: true }
  } catch (err) {
    console.error('[mail] sendWelcomeEmail (resend) failed', err)
    return { ok: false, error: String(err) }
  }
}
