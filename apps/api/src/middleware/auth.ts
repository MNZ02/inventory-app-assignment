import type { Context, Next } from 'hono'
import { jwtVerify } from 'jose'
import type { AuthTokenPayload } from '@inventory/types'

export async function authMiddleware(c: Context, next: Next) {
  const authorization = c.req.header('Authorization')
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return c.json({ data: null, error: 'Missing or invalid authorization header' }, 401)
  }

  const token = authorization.slice(7)
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    c.set('user', payload as unknown as AuthTokenPayload)
    await next()
  } catch {
    return c.json({ data: null, error: 'Invalid or expired token' }, 401)
  }
}
