import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = new URL(request.url).origin
  
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  if (!googleClientId) {
    return NextResponse.json({ error: 'Google Client ID not configured' }, { status: 500 })
  }

  const redirectUri = `${origin}/api/auth/google/callback`
  const scopes = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar.readonly'
  ].join(' ')

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', googleClientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('access_type', 'offline') // Crucial for getting the refresh token
  authUrl.searchParams.set('prompt', 'consent') // Forces consent screen to always return refresh token

  return NextResponse.redirect(authUrl.toString())
}
