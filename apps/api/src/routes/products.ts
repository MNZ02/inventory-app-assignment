import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { productsController } from '../controllers/products.controller'
import { bodyLimit } from '../middleware/size-limit'

const productRouter = new Hono()

productRouter.use('*', authMiddleware)
productRouter.use('*', bodyLimit(2 * 1024 * 1024)) // 2MB limit

productRouter.get('/', productsController.getAll)
productRouter.get('/:id', productsController.getById)
productRouter.post('/', productsController.create)
productRouter.put('/:id', productsController.update)
productRouter.delete('/:id', productsController.delete)

export default productRouter
