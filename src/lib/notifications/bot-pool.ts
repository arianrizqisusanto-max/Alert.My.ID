import { sendTelegramMessage } from './telegram'

export interface TelegramBot {
  id: string
  bot_username: string
  bot_token: string
  user_count: number
  status: 'active' | 'inactive'
  created_at: string
}

/**
 * Automatically registers the default system bot token if the bot pool is empty.
 */
async function autoRegisterDefaultBot(db: any, defaultToken: string, origin: string): Promise<TelegramBot | null> {
  if (!defaultToken || defaultToken.includes('mock') || defaultToken === 'your-telegram-bot-token') {
    // If it's a mock token, create a mock entry in DB
    const mockBot: TelegramBot = {
      id: 'mock-bot-id',
      bot_username: 'AlertMyId_Mock_Bot',
      bot_token: 'mock-token',
      user_count: 0,
      status: 'active',
      created_at: new Date().toISOString()
    }
    await db.prepare(
      'INSERT OR IGNORE INTO telegram_bots (id, bot_username, bot_token, user_count, status) VALUES (?, ?, ?, ?, ?)'
    ).bind(mockBot.id, mockBot.bot_username, mockBot.bot_token, mockBot.user_count, mockBot.status).run()
    return mockBot
  }

  try {
    // Call Telegram getMe API to get bot details
    const res = await fetch(`https://api.telegram.org/bot${defaultToken}/getMe`)
    if (!res.ok) {
      console.error('Failed to fetch bot details from Telegram getMe')
      return null
    }
    const data = await res.json() as any
    if (!data.ok || !data.result?.username) return null

    const botUsername = data.result.username
    const botId = crypto.randomUUID()

    const newBot: TelegramBot = {
      id: botId,
      bot_username: botUsername,
      bot_token: defaultToken,
      user_count: 0,
      status: 'active',
      created_at: new Date().toISOString()
    }

    // Insert bot into DB
    await db.prepare(
      'INSERT OR IGNORE INTO telegram_bots (id, bot_username, bot_token, user_count, status) VALUES (?, ?, ?, ?, ?)'
    ).bind(newBot.id, newBot.bot_username, newBot.bot_token, newBot.user_count, newBot.status).run()

    // Register Webhook for this bot
    const webhookUrl = `${origin}/api/webhooks/telegram?bot_id=${botId}`
    console.log(`[Bot Pool] Registering webhook for @${botUsername} to ${webhookUrl}`)
    
    const webhookRes = await fetch(`https://api.telegram.org/bot${defaultToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`)
    if (!webhookRes.ok) {
      console.error(`Failed to register webhook for bot @${botUsername}:`, await webhookRes.text())
    } else {
      console.log(`[Bot Pool] Webhook registered successfully for @${botUsername}`)
    }

    return newBot
  } catch (err) {
    console.error('Error auto-registering default bot:', err)
    return null
  }
}

/**
 * Assigns an optimal bot from the pool to the user if they don't have one already.
 */
export async function getOrAssignBotForUser(userId: string, db: any, env: any, origin: string): Promise<{ bot_id: string; bot_username: string } | null> {
  // 1. Check if user already has an assigned bot
  const user = await db.prepare(
    'SELECT telegram_bot_id FROM users WHERE id = ?'
  ).bind(userId).first()

  if (user?.telegram_bot_id) {
    const assignedBot = await db.prepare(
      'SELECT id, bot_username FROM telegram_bots WHERE id = ?'
    ).bind(user.telegram_bot_id).first()
    
    if (assignedBot) {
      return { bot_id: assignedBot.id, bot_username: assignedBot.bot_username }
    }
  }

  // 2. No bot assigned. Check if we have any bots in the pool
  let bot = await db.prepare(
    'SELECT id, bot_username FROM telegram_bots WHERE status = "active" ORDER BY user_count ASC LIMIT 1'
  ).first()

  if (!bot) {
    // Auto-register default bot if pool is empty
    const defaultToken = env.TELEGRAM_BOT_TOKEN
    const defaultBot = await autoRegisterDefaultBot(db, defaultToken, origin)
    if (defaultBot) {
      bot = { id: defaultBot.id, bot_username: defaultBot.bot_username }
    } else {
      return null
    }
  }

  // 3. Assign the chosen bot to the user
  await db.prepare(
    'UPDATE users SET telegram_bot_id = ? WHERE id = ?'
  ).bind(bot.id, userId).run()

  // 4. Increment user count on the bot
  await db.prepare(
    'UPDATE telegram_bots SET user_count = user_count + 1 WHERE id = ?'
  ).bind(bot.id).run()

  return { bot_id: bot.id, bot_username: bot.bot_username }
}
