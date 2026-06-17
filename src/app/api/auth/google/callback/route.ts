import { NextResponse } from 'next/server'
import { setSessionCookie } from '@/lib/cloudflare/session'

interface D1Database {
  prepare: (query: string) => {
    bind: (...args: any[]) => {
      first: <T = any>() => Promise<T | null>
      run: () => Promise<any>
      all: <T = any>() => Promise<{ results: T[] }>
    }
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(`${origin}/?error=no_code`)
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
  const db = (process.env.DB as unknown) as D1Database

  if (!googleClientId || !googleClientSecret) {
    return NextResponse.json({ error: 'OAuth credentials not configured' }, { status: 500 })
  }

  if (!db) {
    return NextResponse.json({ error: 'Database binding not configured' }, { status: 500 })
  }

  try {
    // 1. Exchange OAuth code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: 'authorization_code'
      })
    })

    const tokens = await tokenResponse.json() as any
    if (tokens.error) {
      console.error('Token exchange error:', tokens.error_description)
      return NextResponse.redirect(`${origin}/?error=token_exchange_failed`)
    }

    // 2. Fetch User Profile Info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    })
    const googleUser = await userResponse.json() as any

    const userId = googleUser.sub
    const email = googleUser.email
    const name = googleUser.name || 'User'
    const avatar = googleUser.picture || ''
    const refreshToken = tokens.refresh_token // Only returned if consent screen prompt was forced

    // 3. Database Check & Insert D1 (Pure Serverless)
    let userProfile = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<any>()

    if (!userProfile) {
      // Create user in D1
      await db.prepare(
        'INSERT INTO users (id, email, name, avatar, google_refresh_token, google_sync_enabled) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(userId, email, name, avatar, refreshToken || null, refreshToken ? 1 : 0).run()

      // Create a 30-day Free Trial subscription
      const trialId = crypto.randomUUID()
      const startDate = new Date().toISOString()
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      
      await db.prepare(
        'INSERT INTO subscriptions (id, user_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(trialId, userId, 'free_trial', startDate, endDate, 'trialing').run()
    } else {
      // Update existing user name/avatar, and refresh token if provided
      if (refreshToken) {
        await db.prepare(
          'UPDATE users SET name = ?, avatar = ?, google_refresh_token = ?, google_sync_enabled = 1 WHERE id = ?'
        ).bind(name, avatar, refreshToken, userId).run()
      } else {
        await db.prepare(
          'UPDATE users SET name = ?, avatar = ? WHERE id = ?'
        ).bind(name, avatar, userId).run()
      }
    }

    // 4. Set HttpOnly JWT Session Cookie
    await setSessionCookie({
      id: userId,
      email,
      name,
      avatar
    })

    return NextResponse.redirect(`${origin}/dashboard`)
  } catch (err: any) {
    console.error('OAuth Callback Error:', err)
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(err.message || 'unknown')}`)
  }
}
