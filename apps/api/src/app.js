import Koa from 'koa'
import cors from '@koa/cors'
import { bodyParser } from '@koa/bodyparser'

import { requestId } from './middleware/requestId.js'
import { requestLogger } from './middleware/requestLogger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { respond } from './middleware/respond.js'
import { healthRouter } from './routes/health.js'
import { customerRouter } from './routes/customerRouter.js'
import { providerRouter } from './routes/providerRouter.js'
import { ticketRouter } from './routes/ticketRouter.js'

export function createApp() {
  const app = new Koa()

  app.use(requestId())
  app.use(requestLogger())
  app.use(cors())
  app.use(bodyParser())
  app.use(errorHandler())
  app.use(respond())
  app.use(healthRouter.routes())
  app.use(healthRouter.allowedMethods())

  app.use(customerRouter.routes())
  app.use(customerRouter.allowedMethods())
  
  app.use(providerRouter.routes())
  app.use(providerRouter.allowedMethods())

  app.use(ticketRouter.routes())
  app.use(ticketRouter.allowedMethods())

  return app
}
