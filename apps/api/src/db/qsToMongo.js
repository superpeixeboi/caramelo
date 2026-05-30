import { ValidationError } from '../lib/errors/ValidationError.js'

const OPERATORS = ['__gte', '__lte', '__gt', '__lt', '__ne', '__like']
const DISALLOWED_OPERATORS_ON = {
  boolean: ['__gte', '__lte', '__gt', '__lt', '__like'],
  number: ['__like'],
}

function parseKey(key) {
  for (const op of OPERATORS) {
    if (key.endsWith(op)) {
      return { field: key.slice(0, -op.length), operator: op }
    }
  }
  return { field: key, operator: null }
}

function coerce(value, type, format) {
  if (type === 'number') {
    const n = Number(value)
    if (Number.isNaN(n)) {
      throw new ValidationError([{ message: `'${value}' is not a valid number` }])
    }
    return n
  }
  if (type === 'boolean') {
    if (value === 'true') return true
    if (value === 'false') return false
    throw new ValidationError([{ message: `'${value}' is not a valid boolean` }])
  }
  if (format === 'date') return value
  return value
}

function validateOperator(operator, type, field) {
  const disallowed = DISALLOWED_OPERATORS_ON[type]
  if (disallowed && disallowed.includes(operator)) {
    throw new ValidationError([{ message: `Operator ${operator} is not supported for ${type} field '${field}'` }])
  }
}

function splitValue(value) {
  if (value.includes(',')) {
    return value.split(',').map((s) => s.trim())
  }
  return null
}

export function qsToMongo(qs, schema) {
  const props = schema?.properties || {}
  const filter = {}

  for (const [key, rawValue] of Object.entries(qs)) {
    if (key.startsWith('_')) continue

    const { field, operator } = parseKey(key)
    const prop = props[field]
    if (!prop) continue

    const type = prop.type
    const format = prop.format

    if (operator) {
      validateOperator(operator, type, field)
    }

    if (!operator) {
      const parts = splitValue(rawValue)
      if (parts) {
        filter[field] = { $in: parts.map((v) => coerce(v, type, format)) }
      } else {
        filter[field] = coerce(rawValue, type, format)
      }
    } else if (operator === '__ne') {
      const parts = splitValue(rawValue)
      if (parts) {
        filter[field] = { $nin: parts.map((v) => coerce(v, type, format)) }
      } else {
        filter[field] = { $ne: coerce(rawValue, type, format) }
      }
    } else if (operator === '__like') {
      filter[field] = { $regex: rawValue, $options: 'i' }
    } else {
      const mongoOp = `$${operator.slice(2)}`
      filter[field] = { [mongoOp]: coerce(rawValue, type, format) }
    }
  }

  return filter
}
