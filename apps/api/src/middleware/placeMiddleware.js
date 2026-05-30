import { NotFoundError } from "../lib/errors/NotFoundError.js"
import { qsToMongo } from "../db/qsToMongo.js"
import { Place } from "../models/Place.js"

export const fetchPlace = async (id, ctx, next) => {
  ctx.state.place = await Place.findById(id)
  if (!ctx.state.place) throw new NotFoundError('place', id)
  await next()
}

export const findPlace = async (ctx, next) => {
  const query = qsToMongo(ctx.query, Place.schema)
  ctx.state.result = await Place.find({ ...query, customerId: ctx.params.customerId })
  await next()
}

export const createPlace = async (ctx, next) => {
  ctx.status = 201
  ctx.state.result = await Place.create({ ...ctx.request.body, customerId: ctx.params.customerId })
  await next()
}

export const getPlace = async (ctx, next) => {
  ctx.state.result = ctx.state.place
  await next()
}

export const patchPlace = async (ctx, next) => {
  ctx.state.result = await Place.updateById(ctx.params.placeId, ctx.request.body)
  await next()
}

export const deletePlace = async (ctx, next) => {
  await Place.deleteById(ctx.params.placeId)
  ctx.status = 204
  await next()
}