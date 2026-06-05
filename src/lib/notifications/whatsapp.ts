export async function sendWhatsAppReminder(
  to: string, 
  data: { title: string; message: string; date: string; time: string }
) {
  const isMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
  const isEnabled = process.env.WHATSAPP_ENABLED === 'true'
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  // Format phone: remove any non-digit character. WhatsApp needs country-code format (e.g. 62812345678)
  const cleanPhone = to.replace(/\D/g, '')

  console.log(`[WhatsApp Dispatch] To: ${cleanPhone}, Data:`, data)

  if (isMock || !isEnabled || !phoneId || !accessToken || phoneId.includes('mock')) {
    console.log(`[MOCK WHATSAPP SENT] To: ${cleanPhone}\nData:`, data)
    return { success: true, id: `mock-wa-${Date.now()}` }
  }

  try {
    // WhatsApp Cloud API template message payload format
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'reminder_alert',
          language: {
            code: 'en_US',
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: data.title },
                { type: 'text', text: data.message || 'No message contents.' },
                { type: 'text', text: data.date },
                { type: 'text', text: data.time },
              ],
            },
          ],
        },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`WhatsApp API failed: ${errText}`)
    }

    const resJson = await res.json()
    const messageId = resJson.messages?.[0]?.id || `wa-id-${Date.now()}`
    return { success: true, id: messageId }
  } catch (error) {
    const err = error as Error
    console.error(`[WhatsApp Error] ${err.message}`)
    return { success: false, error: err.message }
  }
}
