import { NextResponse } from 'next/server'

interface D1Database {
  prepare: (query: string) => {
    bind: (...args: any[]) => {
      first: <T = any>() => Promise<T | null>
      all: <T = any>() => Promise<{ results: T[] }>
      run: () => Promise<any>
    }
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  // Google Calendar Push notification sends an empty body. Headers identify the event type.
  const state = request.headers.get('x-goog-resource-state')
  if (state === 'sync') {
    return new Response('Sync header acknowledged', { status: 200 })
  }

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 })
  }

  const db = (process.env.DB as unknown) as D1Database
  const scheduler = process.env.REMINDER_SCHEDULER as any

  if (!db || !scheduler) {
    return NextResponse.json({ error: 'Cloudflare bindings not found' }, { status: 500 })
  }

  try {
    // 1. Fetch user refresh token from D1
    const user = await db.prepare(
      'SELECT email, google_refresh_token, google_sync_enabled FROM users WHERE id = ?'
    ).bind(userId).first<any>()

    if (!user || !user.google_refresh_token || user.google_sync_enabled !== 1) {
      return NextResponse.json({ error: 'Google Sync disabled or not configured' }, { status: 200 })
    }

    // 2. Refresh Google Access Token
    const accessToken = await refreshGoogleToken(user.google_refresh_token)

    // 3. Fetch Google Calendar events (next 7 days)
    const timeMin = new Date().toISOString()
    const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ahead

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!calRes.ok) {
      throw new Error(`Google Calendar API error: ${calRes.statusText}`)
    }

    const calData = await calRes.json() as any
    const googleEvents = calData.items || []

    // 4. Fetch existing calendar reminders from D1
    const { results: dbReminders } = await db.prepare(
      'SELECT id, google_event_id, title, message, reminder_date, reminder_time, status FROM reminders WHERE user_id = ? AND google_event_id IS NOT NULL'
    ).bind(userId).all<any>()

    const dbRemMap = new Map<string, any>()
    dbReminders.forEach(r => dbRemMap.set(r.google_event_id, r))

    const processedGoogleEventIds = new Set<string>()

    // 5. Reconcile Google Calendar Events with D1 Reminders
    for (const event of googleEvents) {
      if (!event.start?.dateTime) continue // Skip all-day events without a specific time

      processedGoogleEventIds.add(event.id)
      const eventStart = new Date(event.start.dateTime)
      const timezone = event.start.timeZone || 'Asia/Jakarta' // Fallback timezone

      // Format date/time (YYYY-MM-DD and HH:MM)
      const reminderDate = eventStart.toISOString().split('T')[0]
      const reminderTime = eventStart.toTimeString().split(' ')[0].slice(0, 5) // HH:MM

      const existingRem = dbRemMap.get(event.id)

      if (!existingRem) {
        // [NEW EVENT] - Create a new reminder in D1
        const newRemId = crypto.randomUUID()
        const newRem = {
          id: newRemId,
          user_id: userId,
          title: event.summary || 'Calendar Event',
          message: event.description || '',
          reminder_date: reminderDate,
          reminder_time: reminderTime,
          timezone,
          notification_channels: 'telegram', // Default channel
          recurring_type: 'one_time',
          status: 'active',
          google_event_id: event.id
        }

        await db.prepare(
          'INSERT INTO reminders (id, user_id, title, message, reminder_date, reminder_time, timezone, notification_channels, recurring_type, status, google_event_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          newRem.id, newRem.user_id, newRem.title, newRem.message,
          newRem.reminder_date, newRem.reminder_time, newRem.timezone,
          newRem.notification_channels, newRem.recurring_type, newRem.status, newRem.google_event_id
        ).run()

        // Schedule DO alarm
        await scheduleDOAlarm(scheduler, newRem)
      } else {
        // [MODIFIED EVENT] - Check if details changed and update
        const hasChanged = 
          existingRem.title !== event.summary ||
          existingRem.message !== (event.description || '') ||
          existingRem.reminder_date !== reminderDate ||
          existingRem.reminder_time !== reminderTime ||
          existingRem.status === 'cancelled'

        if (hasChanged) {
          const updatedRem = {
            ...existingRem,
            title: event.summary || 'Calendar Event',
            message: event.description || '',
            reminder_date: reminderDate,
            reminder_time: reminderTime,
            status: 'active' // Re-activate if it was cancelled
          }

          await db.prepare(
            'UPDATE reminders SET title = ?, message = ?, reminder_date = ?, reminder_time = ?, status = "active" WHERE id = ?'
          ).bind(updatedRem.title, updatedRem.message, updatedRem.reminder_date, updatedRem.reminder_time, existingRem.id).run()

          // Reschedule DO alarm
          await scheduleDOAlarm(scheduler, updatedRem)
        }
      }
    }

    // 6. [DELETED EVENTS] - If an event is deleted from Google Calendar, cancel it in D1 and DO
    for (const dbRem of dbReminders) {
      if (!processedGoogleEventIds.has(dbRem.google_event_id) && dbRem.status === 'active') {
        // Cancel reminder in D1
        await db.prepare('UPDATE reminders SET status = "cancelled" WHERE id = ?').bind(dbRem.id).run()
        // Cancel DO alarm
        await cancelDOAlarm(scheduler, dbRem.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Calendar Webhook Sync Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Token refresh helper
async function refreshGoogleToken(refreshToken: string): Promise<string> {
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: googleClientId!,
      client_secret: googleClientSecret!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  })

  const data = await res.json() as any
  if (data.error) {
    throw new Error(data.error_description || 'Failed to refresh token')
  }
  return data.access_token
}

// DO trigger helpers
async function scheduleDOAlarm(scheduler: any, reminder: any) {
  const doId = scheduler.idFromName(reminder.id)
  const stub = scheduler.get(doId)
  
  // Calculate alarm execution timestamp
  const targetStr = `${reminder.reminder_date}T${reminder.reminder_time}:00`
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

  const offsetMinutes = getOffsetMinutes(reminder.timezone)
  const localOffset = -new Date().getTimezoneOffset()
  const diffMinutes = offsetMinutes - localOffset
  const timestamp = new Date(localDate.getTime() - diffMinutes * 60000).getTime()

  await stub.fetch('http://do/schedule', {
    method: 'POST',
    body: JSON.stringify({ reminder, timestamp })
  })
}

async function cancelDOAlarm(scheduler: any, reminderId: string) {
  const doId = scheduler.idFromName(reminderId)
  const stub = scheduler.get(doId)
  await stub.fetch('http://do/cancel', { method: 'POST' })
}
