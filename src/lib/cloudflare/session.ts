import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'alert_session'
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key-32-chars-long!!'

interface SessionPayload {
  id: string
  email: string
  name: string
  avatar: string
}

// Convert string secret to CryptoKey
async function getCryptoKey() {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  const header = b64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const claim = b64UrlEncode(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  }))

  const key = await getCryptoKey()
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${header}.${claim}`)
  )

  const signature = b64UrlEncodeFromBuffer(signatureBuffer)
  return `${header}.${claim}.${signature}`
}

export async function decryptSession(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [header, claim, signature] = parts
    const key = await getCryptoKey()
    
    // Verify signature
    const verified = await crypto.subtle.verify(
      'HMAC',
      key,
      b64UrlDecodeToBuffer(signature),
      new TextEncoder().encode(`${header}.${claim}`)
    )

    if (!verified) return null

    // Decode and check expiration
    const payload = JSON.parse(new TextDecoder().decode(b64UrlDecode(claim)))
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null // Expired
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      avatar: payload.avatar
    }
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return decryptSession(token)
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await encryptSession(payload)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Helpers for Base64URL encoding/decoding
function b64UrlEncode(str: string): string {
  const bin = new TextEncoder().encode(str)
  return b64UrlEncodeFromBuffer(bin.buffer)
}

function b64UrlEncodeFromBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function b64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function b64UrlDecodeToBuffer(str: string): ArrayBuffer {
  return b64UrlDecode(str).buffer as ArrayBuffer
}
