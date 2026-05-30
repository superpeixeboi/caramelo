import { describe, it, expect } from 'vitest'

const { qsToMongo } = await import('../qsToMongo.js')

const STRING_SCHEMA = {
  type: 'object',
  properties: { name: { type: 'string' } },
}

const NUMBER_SCHEMA = {
  type: 'object',
  properties: { age: { type: 'number' } },
}

const BOOL_SCHEMA = {
  type: 'object',
  properties: { active: { type: 'boolean' } },
}

const DATE_SCHEMA = {
  type: 'object',
  properties: { createdAt: { type: 'string', format: 'date' } },
}

const FULL_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    active: { type: 'boolean' },
    score: { type: 'number' },
    createdAt: { type: 'string', format: 'date' },
  },
}

describe('qsToMongo', () => {
  it('returns empty filter for empty qs', () => {
    expect(qsToMongo({}, STRING_SCHEMA)).toEqual({})
  })

  it('coerces string values', () => {
    expect(qsToMongo({ name: 'John' }, STRING_SCHEMA)).toEqual({ name: 'John' })
  })

  it('coerces number values', () => {
    expect(qsToMongo({ age: '30' }, NUMBER_SCHEMA)).toEqual({ age: 30 })
  })

  it('coerces boolean values', () => {
    expect(qsToMongo({ active: 'true' }, BOOL_SCHEMA)).toEqual({ active: true })
    expect(qsToMongo({ active: 'false' }, BOOL_SCHEMA)).toEqual({ active: false })
  })

  it('handles comma-separated values as $in', () => {
    expect(qsToMongo({ name: 'John,Jane' }, STRING_SCHEMA)).toEqual({
      name: { $in: ['John', 'Jane'] },
    })
  })

  it('handles __gte operator', () => {
    expect(qsToMongo({ age__gte: '18' }, NUMBER_SCHEMA)).toEqual({ age: { $gte: 18 } })
  })

  it('handles __lte operator', () => {
    expect(qsToMongo({ age__lte: '65' }, NUMBER_SCHEMA)).toEqual({ age: { $lte: 65 } })
  })

  it('handles __gt operator', () => {
    expect(qsToMongo({ age__gt: '18' }, NUMBER_SCHEMA)).toEqual({ age: { $gt: 18 } })
  })

  it('handles __lt operator', () => {
    expect(qsToMongo({ age__lt: '65' }, NUMBER_SCHEMA)).toEqual({ age: { $lt: 65 } })
  })

  it('handles __ne operator', () => {
    expect(qsToMongo({ name__ne: 'John' }, STRING_SCHEMA)).toEqual({ name: { $ne: 'John' } })
  })

  it('handles __ne with comma-separated as $nin', () => {
    expect(qsToMongo({ name__ne: 'John,Jane' }, STRING_SCHEMA)).toEqual({
      name: { $nin: ['John', 'Jane'] },
    })
  })

  it('handles __like operator as $regex', () => {
    expect(qsToMongo({ name__like: 'ohn' }, STRING_SCHEMA)).toEqual({
      name: { $regex: 'ohn', $options: 'i' },
    })
  })

  it('skips keys not in schema properties', () => {
    expect(qsToMongo({ unknown: 'value', name: 'John' }, STRING_SCHEMA)).toEqual({ name: 'John' })
  })

  it('skips keys starting with underscore', () => {
    expect(qsToMongo({ _id: 'abc', name: 'John' }, STRING_SCHEMA)).toEqual({ name: 'John' })
  })

  it('passes through date format values', () => {
    expect(qsToMongo({ createdAt__gte: '2024-01-01' }, DATE_SCHEMA)).toEqual({
      createdAt: { $gte: '2024-01-01' },
    })
  })

  it('throws ValidationError for invalid number coercion', () => {
    expect(() => qsToMongo({ age: 'abc' }, NUMBER_SCHEMA)).toThrowError('Validation failed')
  })

  it('throws ValidationError for invalid boolean coercion', () => {
    expect(() => qsToMongo({ active: 'yes' }, BOOL_SCHEMA)).toThrowError('Validation failed')
  })

  it('throws ValidationError for __like on number field', () => {
    expect(() => qsToMongo({ age__like: 'foo' }, NUMBER_SCHEMA)).toThrowError('Validation failed')
  })

  it('throws ValidationError for __gte on boolean field', () => {
    expect(() => qsToMongo({ active__gte: 'true' }, BOOL_SCHEMA)).toThrowError('Validation failed')
  })

  it('handles multiple fields in one query', () => {
    const result = qsToMongo(
      { name: 'John', active: 'true' },
      FULL_SCHEMA
    )
    expect(result).toEqual({
      name: 'John',
      active: true,
    })
  })

  it('handles empty schema gracefully', () => {
    expect(qsToMongo({ name: 'John' }, {})).toEqual({})
  })
})
