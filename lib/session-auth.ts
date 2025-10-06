import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const secretKey = process.env.BETTER_AUTH_SECRET || 'fallback-secret-key'
const key = new TextEncoder().encode(secretKey)

export type SessionPayload = {
  userId: string
  email: string
  organizationId: string
  expiresAt: Date
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7 days')
    .sign(key)
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  })
  return payload as SessionPayload
}

export async function createSession(userId: string, email: string, organizationId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const session = await encrypt({ userId, email, organizationId, expiresAt })

  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return session
}

export async function verifySession() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value

  if (!cookie) return null

  try {
    const session = await decrypt(cookie)

    if (new Date() > session.expiresAt) {
      return null
    }

    return session
  } catch (error) {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function updateSession(request: NextRequest) {
  const cookie = request.cookies.get('session')?.value

  if (!cookie) return null

  try {
    const parsed = await decrypt(cookie)

    if (new Date() > parsed.expiresAt) {
      return null
    }

    const res = NextResponse.next()
    res.cookies.set({
      name: 'session',
      value: await encrypt(parsed),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return res
  } catch (error) {
    return null
  }
}