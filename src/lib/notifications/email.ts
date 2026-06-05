export async function sendEmail(to: string, subject: string, htmlContent: string) {
  const isMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'alerts@alert.my.id'

  console.log(`[Email Dispatch] To: ${to}, Subject: ${subject}`)

  if (isMock || !resendApiKey || resendApiKey === 're_mock') {
    console.log(`[MOCK EMAIL SENT] To: ${to}\nSubject: ${subject}\nContent:\n${htmlContent}`)
    return { success: true, id: `mock-email-${Date.now()}` }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `Alert.my.id <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Resend API failed: ${errText}`)
    }

    const data = await res.json()
    return { success: true, id: data.id }
  } catch (error) {
    const err = error as Error
    console.error(`[Email Error] ${err.message}`)
    return { success: false, error: err.message }
  }
}
