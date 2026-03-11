import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import transactionRoutes from './routes/transactions'
import dashboardRoutes from './routes/dashboard'
import uploadRoutes from './routes/upload'

const app = new Hono()

app.use('*', cors())
app.use('*', logger())

app.get('/health', (c) => c.json({ data: { status: 'ok' } }))

app.route('/auth', authRoutes)
app.route('/products', productRoutes)
app.route('/transactions', transactionRoutes)
app.route('/dashboard', dashboardRoutes)
app.route('/upload', uploadRoutes)

app.notFound((c) => c.json({ data: null, error: 'Not found' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ data: null, error: 'Internal server error' }, 500)
})

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
}
