import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { transactionsController } from '../controllers/transactions.controller'

const transactionRouter = new Hono()

transactionRouter.use('*', authMiddleware)

transactionRouter.get('/', transactionsController.getAll)
transactionRouter.post('/', transactionsController.create)

export default transactionRouter
