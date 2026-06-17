import { NextResponse } from 'next/server'
import { getSession } from '@/lib/cloudflare/session'

interface D1Database {
  prepare: (query: string) => {
    bind: (...args: any[]) => {
      first: <T = any>() => Promise<T | null>
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
    const subscription = await db.prepare(
      'SELECT id, user_id, plan_id, start_date, end_date, status FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(session.id).first<any>()

    return NextResponse.json(subscription)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
