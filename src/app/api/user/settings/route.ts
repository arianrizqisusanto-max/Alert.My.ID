import { NextResponse } from 'next/server'
import { getSession } from '@/lib/cloudflare/session'

interface D1Database {
  prepare: (query: string) => {
    bind: (...args: any[]) => {
      run: () => Promise<any>
    }
  }
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = (process.env.DB as unknown) as D1Database
  if (!db) {
    return NextResponse.json({ error: 'Database binding not found' }, { status: 500 })
  }

  try {
    const body = await request.json() as any
    
    // We can update telegram_chat_id, whatsapp_number, or google_sync_enabled
    if ('telegram_chat_id' in body) {
      await db.prepare('UPDATE users SET telegram_chat_id = ? WHERE id = ?')
        .bind(body.telegram_chat_id, session.id).run()
    }
    
    if ('whatsapp_number' in body) {
      await db.prepare('UPDATE users SET whatsapp_number = ? WHERE id = ?')
        .bind(body.whatsapp_number, session.id).run()
    }

    if ('google_sync_enabled' in body) {
      const val = body.google_sync_enabled ? 1 : 0
      await db.prepare('UPDATE users SET google_sync_enabled = ? WHERE id = ?')
        .bind(val, session.id).run()
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
