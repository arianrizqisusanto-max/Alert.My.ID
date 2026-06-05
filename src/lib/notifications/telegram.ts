export async function sendTelegramMessage(chatId: string, text: string) {
  const isMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  console.log(`[Telegram Dispatch] To ChatId: ${chatId}, Msg: ${text}`)

  if (isMock || !botToken || botToken.includes('mock')) {
    console.log(`[MOCK TELEGRAM SENT] ChatId: ${chatId}\nMessage: ${text}`)
    return { success: true, id: `mock-tg-${Date.now()}` }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Telegram API failed: ${errText}`)
    }

    const data = await res.json()
    return { success: true, id: data.result.message_id.toString() }
  } catch (error) {
    const err = error as Error
    console.error(`[Telegram Error] ${err.message}`)
    return { success: false, error: err.message }
  }
}
