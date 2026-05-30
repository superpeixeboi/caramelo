import Router from '@koa/router'
import { Ticket } from '../models/Ticket.js'
import {
  createTicket,
  fetchTicket,
  findTicket,
  patchTicket,
} from '../middleware/ticketMiddleware.js'

const router = new Router({ prefix: '/api' })

router.param('ticketId', fetchTicket)

router.get('/tickets', findTicket)
router.post('/tickets', createTicket)
router.get('/tickets/:ticketId', fetchTicket)
router.patch('/tickets/:ticketId', patchTicket)

export const ticketRouter = router
