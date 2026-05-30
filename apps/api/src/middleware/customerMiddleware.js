import { NotFoundError } from "../lib/errors/NotFoundError.js"
import { qsToMongo } from "../db/qsToMongo.js"
import { Customer } from "../models/Customer.js"

export const fetchCustomer = async (id, ctx, next) => {
  ctx.state.customer = await Customer.findById(id)
  if (!ctx.state.customer) throw new NotFoundError('customer', id)
  await next()
}

export const findCustomer = async (ctx, next) => { 
  ctx.state.result = await Customer.find(qsToMongo(ctx.query, Customer.schema))
  await next()
}

export const createCustomer = async (ctx, next) => {
  ctx.status = 201
  ctx.state.result = await Customer.create(ctx.request.body)
  await next()
}

export const getCustomer = async (ctx, next) => {
  ctx.state.result = ctx.state.customer
  await next()
}

export const patchCustomer = async (ctx, next) => {
  ctx.state.result = await Customer.updateById(ctx.params.customerId, ctx.request.body)
  await next()
}

export const deleteCustomer = async (ctx, next) => {
  await Customer.deleteById(ctx.params.customerId)
  ctx.status = 204
  await next()
}
