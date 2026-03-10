import { Context } from 'hono'
import { z } from 'zod'
import { authService } from '../services/auth.service'

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authController = {
  async register(c: Context) {
    const body = await c.req.json().catch(() => null)
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return c.json({ data: null, error: parsed.error.flatten() }, 400)
    }

    const { name, email, password } = parsed.data

    try {
      const result = await authService.register(name, email, password)
      return c.json(
        {
          data: result,
          message: 'Registered successfully',
        },
        201,
      )
    } catch (err: any) {
      if (err.message === 'EMAIL_EXISTS') {
        return c.json({ data: null, error: 'Email already in use' }, 400)
      }
      return c.json({ data: null, error: 'Internal server error' }, 500)
    }
  },

  async login(c: Context) {
    const body = await c.req.json().catch(() => null)
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return c.json({ data: null, error: parsed.error.flatten() }, 400)
    }

    const { email, password } = parsed.data

    try {
      const result = await authService.login(email, password)
      return c.json({
        data: result,
        message: 'Logged in successfully',
      })
    } catch (err: any) {
      if (err.message === 'INVALID_CREDENTIALS') {
        return c.json({ data: null, error: 'Invalid credentials' }, 401)
      }
      return c.json({ data: null, error: 'Internal server error' }, 500)
    }
  },
}
