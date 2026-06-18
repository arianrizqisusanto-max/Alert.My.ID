import { NextResponse } from 'next/server'

interface D1Database {
  prepare: (query: string) => {
    bind: (...args: any[]) => {
      first: <T = any>() => Promise<T | null>
      run: () => Promise<any>
    }
  }
}

export async function POST(request: Request) {
  const db = (process.env.DB as unknown) as D1Database
  if (!db) {
    return NextResponse.json({ error: 'Database binding not found' }, { status: 500 })
  }

  try {
    const url = new URL(request.url)
    const botId = url.searchParams.get('bot_id')
    const body = await request.json() as any

    // Telegram webhook payload has 'message'
    const message = body.message
    if (!message || !message.text || !message.from) {
      return NextResponse.json({ success: true, message: 'Ignored non-message update' })
    }

    const text = message.text.trim()
    const chatId = message.from.id.toString()
    const firstName = message.from.first_name || 'there'

    // Check if the command is /start with user_id
    if (text.startsWith('/start')) {
      const parts = text.split(' ')
      if (parts.length < 2) {
        // Simple start with no payload
        await sendReply(botId, chatId, `Welcome ${firstName}! To link your Alert.my.id account, please click the "Link Telegram Bot" button inside your dashboard settings.`, db)
        return NextResponse.json({ success: true })
      }

      const userId = parts[1].trim()

      // 1. Verify user exists in D1 database
      const user = await db.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first()
      if (!user) {
        await sendReply(botId, chatId, `⚠️ Account verification failed. The link code is invalid or expired. Please generate a new one from your dashboard settings.`, db)
        return NextResponse.json({ success: true })
      }

      // 2. Link user's chat_id and assigned bot_id
      await db.prepare(
        'UPDATE users SET telegram_chat_id = ?, telegram_bot_id = ? WHERE id = ?'
      ).bind(chatId, botId || null, userId).run()

      // 3. Send welcome confirmation message
      const welcomeText = `🎉 *Alert.my.id Linked Successfully!*\n\nHello *${firstName}*, your account has been connected. You will now receive your scheduled reminders and calendar alerts directly inside this chat.\n\nGo back to your dashboard to manage your alerts!`
      await sendReply(botId, chatId, welcomeText, db)

      console.log(`[Bot Pool] Linked user ${userId} to Telegram ChatId ${chatId} using Bot ${botId}`)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Telegram webhook error:', err)
    // Always return 200 to Telegram to avoid retries clogging the worker
    return NextResponse.json({ error: err.message }, { status: 200 })
  }
}

/**
 * Sends a message using the specific bot token or default fallback.
 */
async function sendReply(botId: string | null, chatId: string, text: string, db: D1Database) {
  let token = process.env.TELEGRAM_BOT_TOKEN

  // If a specific bot_id was passed, look up its token
  if (botId && botId !== 'mock-bot-id') {
    const bot = await db.prepare('SELECT bot_token FROM telegram_bots WHERE id = ?').bind(botId).first<any>()
    if (bot?.bot_token) {
      token = bot.bot_token
    }
  }

  if (!token || token.includes('mock') || token === 'your-telegram-bot-token') {
    console.log(`[MOCK TELEGRAM REPLY] To: ${chatId}, Msg: ${text}`)
    return
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    })
  } catch (err) {
    console.error('Failed to send telegram reply message:', err)
  }
}
