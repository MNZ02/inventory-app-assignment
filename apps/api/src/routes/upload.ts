import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { uploadController } from '../controllers/upload.controller'

const uploadRouter = new Hono()

uploadRouter.use('*', authMiddleware)
uploadRouter.get('/sign', uploadController.sign)

export default uploadRouter
