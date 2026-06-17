import { NextResponse } from 'next/server'
import { getSession } from '@/lib/cloudflare/session'

interface D1Database {
  prepare: (query: string) => {
    bind: (...args: any[]) => {
      all: <T = any>() => Promise<{ results: T[] }>
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
      `SELECT l.id, l.reminder_id, l.sent_at, l.channel, l.delivery_status, l.error_message, r.title as reminder_title
       FROM reminder_logs l
       JOIN reminders r ON l.reminder_id = r.id
       WHERE r.user_id = ?
       ORDER BY l.sent_at DESC`
    ).bind(session.id).all<any>()

    return NextResponse.json(results)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
