import { NextResponse } from 'next/server'
import { getSession } from '@/lib/cloudflare/session'
import { getOrAssignBotForUser } from '@/lib/notifications/bot-pool'

interface D1Database {
  prepare: (query: string) => {
    bind: (...args: any[]) => {
      first: <T = any>() => Promise<T | null>
    }
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ user: null })
    }

    const db = (process.env.DB as unknown) as D1Database
    if (!db) {
      return NextResponse.json({ user: session }) // Fallback to session details
    }

    // Retrieve fresh profile columns joined with assigned telegram bot from D1
    let profile = await db.prepare(
      'SELECT u.id, u.email, u.name, u.avatar, u.telegram_chat_id, u.whatsapp_number, u.telegram_bot_id, b.bot_username AS telegram_bot_name ' +
      'FROM users u ' +
      'LEFT JOIN telegram_bots b ON u.telegram_bot_id = b.id ' +
      'WHERE u.id = ?'
    ).bind(session.id).first<any>()

    if (!profile) {
      return NextResponse.json({ user: session })
    }

    // If no bot assigned yet, dynamically assign one from the pool
    if (!profile.telegram_bot_name) {
      const origin = new URL(request.url).origin
      const assigned = await getOrAssignBotForUser(session.id, db, process.env, origin)
      if (assigned) {
        profile.telegram_bot_id = assigned.bot_id
        profile.telegram_bot_name = assigned.bot_username
      }
    }

    return NextResponse.json({ user: profile })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
