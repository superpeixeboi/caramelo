import { NotFoundError } from '../lib/errors/NotFoundError.js'
import { qsToMongo } from '../lib/qsToMongo.js'
import { Provider } from '../models/Provider.js'
import { Service } from '../models/Service.js'

export const fetchProvider = async (id, ctx, next) => {
  ctx.state.provider = await Provider.findById(id)
  if (!ctx.state.provider) throw new NotFoundError('provider', id)
  await next()
}

export const findProvider = async (ctx, next) => {
  ctx.state.result = await Provider.find(qsToMongo(ctx.query, Provider.schema))
  await next()
}

export const createProvider = async (ctx, next) => {
  ctx.status = 201
  ctx.state.result = await Provider.create(ctx.request.body)
  await next()
}

export const getProvider = async (ctx, next) => {
  ctx.state.result = ctx.state.provider
  await next()
}

export const patchProvider = async (ctx, next) => {
  ctx.state.result = await Provider.updateById(ctx.params.providerId, ctx.request.body)
  await next()
}

export const deleteProvider = async (ctx, next) => {
  await Provider.deleteById(ctx.params.providerId)
  ctx.status = 204
  await next()
}

export const fetchService = async (id, ctx, next) => {
  ctx.state.service = await Service.findById(id)
  if (!ctx.state.service) throw new NotFoundError('service', id)
  await next()
}

// Provider service access

export const findProviderService = async (ctx, next) => {
  const query = qsToMongo(ctx.query, Service.schema)
  ctx.state.result = await Service.find({ ...query, providerId: ctx.params.providerId })
  await next()
}

export const getProviderService = async (ctx, next) => {
  ctx.state.result = ctx.state.service
  await next()
}

export const patchProviderService = async (ctx, next) => {
  ctx.state.result = await Service.updateById(ctx.params.serviceId, ctx.request.body)
  await next()
}
