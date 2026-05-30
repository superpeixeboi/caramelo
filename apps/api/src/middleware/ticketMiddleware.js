import { NotFoundError } from '../lib/errors/NotFoundError.js'
import { qsToMongo } from '../db/qsToMongo.js'
import { Ticket } from '../models/Ticket.js'

export const fetchTicket = async (id, ctx, next) => {
  ctx.state.ticket = await Ticket.findById(id)
  if (!ctx.state.ticket) throw new NotFoundError('ticket', id)
  await next()
}

export const findTicket = async (ctx, next) => {
  ctx.state.result = await Ticket.find(qsToMongo(ctx.query, Ticket.schema))
  await next()
}

export const createTicket = async (ctx, next) => {
  ctx.status = 201
  ctx.state.result = await Ticket.create(ctx.request.body)
  await next()
}

export const getTicket = async (ctx, next) => {
  ctx.state.result = ctx.state.ticket
  await next()
}

export const patchTicket = async (ctx, next) => {
  ctx.state.result = await Ticket.updateById(ctx.params.ticketId, ctx.request.body)
  await next()
}
