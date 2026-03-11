import { Context, Next } from 'hono'

export const bodyLimit = (maxSize: number) => {
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header('content-length')
    if (contentLength && parseInt(contentLength, 10) > maxSize) {
      return c.json({ data: null, error: 'Payload too large' }, 413)
    }
    await next()
  }
}
