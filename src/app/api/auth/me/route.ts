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
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ user: null })
    }

    const db = (process.env.DB as unknown) as D1Database
    if (!db) {
      return NextResponse.json({ user: session }) // Fallback to session details
    }

    // Retrieve fresh profile columns (like telegram_chat_id, whatsapp_number) from D1
    const profile = await db.prepare(
      'SELECT id, email, name, avatar, telegram_chat_id, whatsapp_number FROM users WHERE id = ?'
    ).bind(session.id).first<any>()

    if (!profile) {
      return NextResponse.json({ user: session })
    }

    return NextResponse.json({ user: profile })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
