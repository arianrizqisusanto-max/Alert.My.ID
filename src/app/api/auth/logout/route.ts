import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/cloudflare/session'

export async function POST(request: Request) {
  const { origin } = new URL(request.url)
  await clearSessionCookie()
  return NextResponse.json({ success: true })
}

// Support GET for easy browser triggers
export async function GET(request: Request) {
  await clearSessionCookie()
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/`)
}
