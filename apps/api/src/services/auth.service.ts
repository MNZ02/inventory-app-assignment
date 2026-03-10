import { eq } from 'drizzle-orm'
import { SignJWT } from 'jose'
import { db } from '../db'
import { users } from '../db/schema'
import type { User } from '@inventory/types'

export const authService = {
  async signToken(payload: { sub: string; email: string; role: string }) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(secret)
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existing.length > 0) {
      throw new Error('EMAIL_EXISTS')
    }

    const passwordHash = await Bun.password.hash(password)
    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash })
      .returning()

    const token = await this.signToken({ sub: user.id, email: user.email, role: user.role })
    const userResponse: User = { id: user.id, name: user.name, email: user.email, role: user.role }
    return { token, user: userResponse }
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const valid = await Bun.password.verify(password, user.passwordHash)
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const token = await this.signToken({ sub: user.id, email: user.email, role: user.role })
    const userResponse: User = { id: user.id, name: user.name, email: user.email, role: user.role }
    return { token, user: userResponse }
  },
}
