import { NextResponse } from 'next/server'
import { getSession } from '@/lib/cloudflare/session'

interface D1Database {
  prepare: (query: string) => {
    bind: (...args: any[]) => {
      all: <T = any>() => Promise<{ results: T[] }>
      run: () => Promise<any>
    }
  }
}

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = (process.env.DB as unknown) as D1Database
  if (!db) {
    return NextResponse.json({ error: 'Database binding not found' }, { status: 500 })
  }

  try {
    const { results } = await db.prepare(
      'SELECT * FROM reminders WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(session.id).all<any>()

    // Parse notification_channels comma-separated string back to array
    const reminders = results.map(r => ({
      ...r,
      notification_channels: typeof r.notification_channels === 'string'
        ? r.notification_channels.split(',')
        : []
    }))

    return NextResponse.json(reminders)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = (process.env.DB as unknown) as D1Database
  const scheduler = process.env.REMINDER_SCHEDULER as any

  if (!db || !scheduler) {
    return NextResponse.json({ error: 'Cloudflare bindings not found' }, { status: 500 })
  }

  try {
    const body = await request.json() as any
    const id = crypto.randomUUID()
    
    const reminder = {
      id,
      user_id: session.id,
      title: body.title,
      message: body.message || '',
      reminder_date: body.reminder_date,
      reminder_time: body.reminder_time,
      timezone: body.timezone,
      notification_channels: Array.isArray(body.notification_channels) 
        ? body.notification_channels.join(',') 
        : 'telegram',
      recurring_type: body.recurring_type || 'one_time',
      status: 'active'
    }

    // 1. Insert into D1 Database
    await db.prepare(
      'INSERT INTO reminders (id, user_id, title, message, reminder_date, reminder_time, timezone, notification_channels, recurring_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      reminder.id, reminder.user_id, reminder.title, reminder.message,
      reminder.reminder_date, reminder.reminder_time, reminder.timezone,
      reminder.notification_channels, reminder.recurring_type, reminder.status
    ).run()

    // 2. Schedule using Durable Object
    const doId = scheduler.idFromName(id)
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

    // Call schedule method on DO stub
    const doRes = await stub.fetch('http://do/schedule', {
      method: 'POST',
      body: JSON.stringify({ reminder, timestamp })
    })

    if (!doRes.ok) {
      throw new Error(`Failed to schedule in Durable Object: ${doRes.statusText}`)
    }

    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
