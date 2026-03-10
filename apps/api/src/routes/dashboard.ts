import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { dashboardController } from '../controllers/dashboard.controller'

const dashboardRouter = new Hono()

dashboardRouter.use('*', authMiddleware)

dashboardRouter.get('/', dashboardController.getStats)

export default dashboardRouter
