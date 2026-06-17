import { NextResponse } from 'next/server'
import { getSession } from '@/lib/cloudflare/session'

interface D1Database {
  prepare: (query: string) => {
    bind: (...args: any[]) => {
      first: <T = any>() => Promise<T | null>
      run: () => Promise<any>
    }
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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
    const reminderId = params.id

    // Check ownership
    const existingRem = await db.prepare(
      'SELECT id, user_id FROM reminders WHERE id = ? AND user_id = ?'
    ).bind(reminderId, session.id).first()

    if (!existingRem) {
      return NextResponse.json({ error: 'Reminder not found or unauthorized' }, { status: 404 })
    }

    const updatedRem = {
      id: reminderId,
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
      status: body.status || 'active'
    }

    // 1. Update D1
    await db.prepare(
      'UPDATE reminders SET title = ?, message = ?, reminder_date = ?, reminder_time = ?, timezone = ?, notification_channels = ?, recurring_type = ?, status = ? WHERE id = ?'
    ).bind(
      updatedRem.title, updatedRem.message, updatedRem.reminder_date, updatedRem.reminder_time,
      updatedRem.timezone, updatedRem.notification_channels, updatedRem.recurring_type, updatedRem.status,
      reminderId
    ).run()

    // 2. Reschedule DO
    const doId = scheduler.idFromName(reminderId)
    const stub = scheduler.get(doId)

    if (updatedRem.status === 'active') {
      // Calculate alarm execution timestamp
      const targetStr = `${updatedRem.reminder_date}T${updatedRem.reminder_time}:00`
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

      const offsetMinutes = getOffsetMinutes(updatedRem.timezone)
      const localOffset = -new Date().getTimezoneOffset()
      const diffMinutes = offsetMinutes - localOffset
      const timestamp = new Date(localDate.getTime() - diffMinutes * 60000).getTime()

      await stub.fetch('http://do/schedule', {
        method: 'POST',
        body: JSON.stringify({ reminder: updatedRem, timestamp })
      })
    } else {
      // Cancel DO alarm if paused/cancelled
      await stub.fetch('http://do/cancel', { method: 'POST' })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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
    const reminderId = params.id

    // Check ownership
    const existingRem = await db.prepare(
      'SELECT id FROM reminders WHERE id = ? AND user_id = ?'
    ).bind(reminderId, session.id).first()

    if (!existingRem) {
      return NextResponse.json({ error: 'Reminder not found or unauthorized' }, { status: 404 })
    }

    // 1. Delete from D1
    await db.prepare('DELETE FROM reminders WHERE id = ?').bind(reminderId).run()

    // 2. Cancel DO Alarm
    const doId = scheduler.idFromName(reminderId)
    const stub = scheduler.get(doId)
    await stub.fetch('http://do/cancel', { method: 'POST' })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
