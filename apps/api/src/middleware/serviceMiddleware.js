import { NotFoundError } from "../lib/errors/NotFoundError.js"
import { qsToMongo } from "../db/qsToMongo.js"
import { Service } from "../models/Service.js"

export const fetchService = async (id, ctx, next) => {
  ctx.state.service = await Service.findById(id)
  if (!ctx.state.service) throw new NotFoundError('service', id)
  await next()
}

export const findService = async (ctx, next) => {
  const query = qsToMongo(ctx.query, Service.schema)
  ctx.state.result = await Service.find({ ...query, placeId: ctx.params.placeId })
  await next()
}

export const createService = async (ctx, next) => {
  ctx.status = 201
  ctx.state.result = await Service.create({ ...ctx.request.body, customerId: ctx.params.customerId, placeId: ctx.params.placeId })
  await next()
}

export const getService = async (ctx, next) => {
  ctx.state.result = ctx.state.service
  await next()
}

export const patchService = async (ctx, next) => {
  ctx.state.result = await Service.updateById(ctx.params.serviceId, ctx.request.body)
  await next()
}

export const deleteService = async (ctx, next) => {
  await Service.deleteById(ctx.params.serviceId)
  ctx.status = 204
  await next()
}