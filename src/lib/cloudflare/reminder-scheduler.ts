// Cloudflare Durable Object for Reminder Scheduling & Delivery
// Handles stateful alarms to eliminate database cron polling.

export interface DurableObjectState {
  storage: {
    put: (key: string, value: any) => Promise<void>
    get: <T = any>(key: string) => Promise<T | undefined>
    delete: (key: string) => Promise<boolean>
    setAlarm: (timestamp: number) => Promise<void>
    deleteAlarm: () => Promise<void>
  }
}

export class ReminderScheduler {
  state: DurableObjectState
  env: any

  constructor(state: DurableObjectState, env: any) {
    this.state = state
    this.env = env
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    
    try {
      if (url.pathname === '/schedule') {
        const { reminder, timestamp } = (await request.json()) as any
        
        // Save reminder metadata to DO storage
        await this.state.storage.put('reminder', reminder)
        // Schedule alarm at timestamp
        await this.state.storage.setAlarm(timestamp)
        
        return new Response(JSON.stringify({ success: true, message: 'Alarm scheduled' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      if (url.pathname === '/cancel') {
        // Delete reminder metadata & cancel alarm
        await this.state.storage.delete('reminder')
        await this.state.storage.deleteAlarm()
        
        return new Response(JSON.stringify({ success: true, message: 'Alarm cancelled' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      return new Response('Not Found', { status: 404 })
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  // Woken up by Cloudflare Edge at exactly the scheduled timestamp
  async alarm() {
    const reminder = await this.state.storage.get('reminder') as any
    if (!reminder) return

    const db = this.env.DB
    if (!db) {
      console.error('Durable Object Alarm: DB binding not configured')
      return
    }

    try {
      // 1. Fetch user data along with assigned bot token from D1
      const user = await db.prepare(
        'SELECT u.telegram_chat_id, u.whatsapp_number, b.bot_token ' +
        'FROM users u ' +
        'LEFT JOIN telegram_bots b ON u.telegram_bot_id = b.id ' +
        'WHERE u.id = ?'
      ).bind(reminder.user_id).first()

      if (!user) {
        console.error(`Durable Object Alarm: User profile not found for reminder ${reminder.id}`)
        return
      }

      // Check if reminder status is cancelled in D1
      const dbRem = await db.prepare(
        'SELECT status FROM reminders WHERE id = ?'
      ).bind(reminder.id).first()

      if (!dbRem || dbRem.status !== 'active') {
        console.log(`Reminder ${reminder.id} is inactive (${dbRem?.status || 'deleted'}), skipping delivery.`)
        return
      }

      // 2. Dispatch notifications
      const channels = typeof reminder.notification_channels === 'string'
        ? reminder.notification_channels.split(',')
        : reminder.notification_channels

      for (const channel of channels) {
        let deliveryStatus = 'sent'
        let errMsg = ''

        if (channel === 'telegram') {
          if (user.telegram_chat_id) {
            const text = `🔔 *Reminder Alert: ${reminder.title}*\n\n${reminder.message || 'No additional details.'}\n\n_Scheduled: ${reminder.reminder_date} ${reminder.reminder_time} (${reminder.timezone})_`
            const tgRes = await this.sendTelegram(user.telegram_chat_id, text, user.bot_token)
            if (!tgRes.success) {
              deliveryStatus = 'failed'
              errMsg = tgRes.error || 'Telegram delivery failed'
            }
          } else {
            deliveryStatus = 'failed'
            errMsg = 'Telegram chat ID not configured'
          }
        } else if (channel === 'whatsapp') {
          if (user.whatsapp_number) {
            const waRes = await this.sendWhatsApp(user.whatsapp_number, reminder)
            if (!waRes.success) {
              deliveryStatus = 'failed'
              errMsg = waRes.error || 'WhatsApp delivery failed'
            }
          } else {
            deliveryStatus = 'failed'
            errMsg = 'WhatsApp number not configured'
          }
        }

        // 3. Log outcome in D1
        const logId = crypto.randomUUID()
        await db.prepare(
          'INSERT INTO reminder_logs (id, reminder_id, channel, delivery_status, error_message) VALUES (?, ?, ?, ?, ?)'
        ).bind(logId, reminder.id, channel, deliveryStatus, errMsg || null).run()
      }

      // 4. Update status / reschedule recurring pattern
      if (reminder.recurring_type === 'one_time') {
        await db.prepare('UPDATE reminders SET status = "completed" WHERE id = ?').bind(reminder.id).run()
      } else {
        // Calculate next recurring date-time
        const nextDate = this.calculateNextOccurrence(reminder.reminder_date, reminder.recurring_type)
        
        await db.prepare(
          'UPDATE reminders SET reminder_date = ? WHERE id = ?'
        ).bind(nextDate, reminder.id).run()

        // Update DO memory with new date
        reminder.reminder_date = nextDate
        await this.state.storage.put('reminder', reminder)

        // Reschedule new alarm
        const nextTimestamp = this.parseTimestamp(nextDate, reminder.reminder_time, reminder.timezone)
        await this.state.storage.setAlarm(nextTimestamp)
        console.log(`Rescheduled recurring reminder ${reminder.id} to ${nextDate}`)
      }
    } catch (err: any) {
      console.error(`Alarm execution failed for reminder ${reminder.id}:`, err)
    }
  }

  // Helper to send Telegram message
  async sendTelegram(chatId: string, text: string, botToken?: string | null): Promise<{ success: boolean; error?: string }> {
    const token = botToken || this.env.TELEGRAM_BOT_TOKEN
    if (!token) return { success: false, error: 'TELEGRAM_BOT_TOKEN not configured' }

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown'
        })
      })

      if (!res.ok) {
        const errObj = await res.json() as any
        return { success: false, error: errObj.description || `HTTP ${res.status}` }
      }

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Helper to send WhatsApp template
  async sendWhatsApp(phoneNumber: string, reminder: any): Promise<{ success: boolean; error?: string }> {
    const token = this.env.WHATSAPP_ACCESS_TOKEN
    const phoneId = this.env.WHATSAPP_PHONE_NUMBER_ID
    const apiUrl = this.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0'

    if (!token || !phoneId) {
      return { success: false, error: 'WhatsApp API credentials not configured' }
    }

    try {
      const res = await fetch(`${apiUrl}/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: 'reminder_alert',
            language: { code: 'en_US' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: reminder.title },
                  { type: 'text', text: reminder.message || 'No additional details.' },
                  { type: 'text', text: `${reminder.reminder_date} ${reminder.reminder_time}` }
                ]
              }
            ]
          }
        })
      })

      if (!res.ok) {
        const errObj = await res.json() as any
        return { success: false, error: errObj.error?.message || `HTTP ${res.status}` }
      }

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Helper to compute next recurring date
  calculateNextOccurrence(currentDateStr: string, recurringType: string): string {
    const [year, month, day] = currentDateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    switch (recurringType) {
      case 'daily':
        date.setDate(date.getDate() + 1)
        break
      case 'weekly':
        date.setDate(date.getDate() + 7)
        break
      case 'monthly':
        date.setMonth(date.getMonth() + 1)
        break
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1)
        break
    }

    const nextYear = date.getFullYear()
    const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
    const nextDay = String(date.getDate()).padStart(2, '0')
    return `${nextYear}-${nextMonth}-${nextDay}`
  }

  // Helper to parse date-time to timestamp in specific timezone
  parseTimestamp(dateStr: string, timeStr: string, timezone: string): number {
    // Basic timezone offset calculation
    const targetStr = `${dateStr}T${timeStr}:00`
    
    // Parse target local time
    const localDate = new Date(targetStr)
    
    const getOffsetMinutes = (tz: string) => {
      try {
        const date = new Date()
        const tzString = date.toLocaleString('en-US', { timeZone: tz })
        const tzDate = new Date(tzString)
        return (tzDate.getTime() - date.getTime()) / 60000
      } catch {
        return 0
      }
    }

    const offsetMinutes = getOffsetMinutes(timezone)
    const localOffset = -new Date().getTimezoneOffset()
    const diffMinutes = offsetMinutes - localOffset
    
    return new Date(localDate.getTime() - diffMinutes * 60000).getTime()
  }
}
