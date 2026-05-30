import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createMockCtx, createMockNext } from '../../test-helpers.js'

vi.mock('../../models/Place.js', () => ({
  Place: {
    findById: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
  },
}))

vi.mock('../../db/qsToMongo.js', () => ({
  qsToMongo: vi.fn((qs) => qs),
}))

import { Place } from '../../models/Place.js'
import { qsToMongo } from '../../db/qsToMongo.js'
import { NotFoundError } from '../../lib/errors/NotFoundError.js'

const {
  fetchPlace,
  findPlace,
  createPlace,
  getPlace,
  patchPlace,
  deletePlace,
} = await import('../placeMiddleware.js')

const mockDoc = { _id: 'abc123', name: 'Casa', customerId: 'cust1' }

describe('placeMiddleware', () => {
  let ctx
  const next = createMockNext()

  beforeEach(() => {
    vi.clearAllMocks()
    ctx = createMockCtx()
  })

  describe('fetchPlace', () => {
    it('sets place on state and calls next', async () => {
      Place.findById.mockResolvedValue(mockDoc)
      await fetchPlace('abc123', ctx, next)
      expect(Place.findById).toHaveBeenCalledWith('abc123')
      expect(ctx.state.place).toEqual(mockDoc)
      expect(next).toHaveBeenCalledOnce()
    })

    it('throws NotFoundError when place not found', async () => {
      Place.findById.mockResolvedValue(null)
      await expect(fetchPlace('abc123', ctx, next)).rejects.toThrow(NotFoundError)
    })
  })

  describe('findPlace', () => {
    it('sets result with customerId filter', async () => {
      const docs = [mockDoc]
      Place.find.mockResolvedValue(docs)
      ctx.params.customerId = 'cust1'
      ctx.query = { name: 'Casa' }
      await findPlace(ctx, next)
      expect(qsToMongo).toHaveBeenCalledWith(ctx.query, Place.schema)
      expect(Place.find).toHaveBeenCalledWith({ ...ctx.query, customerId: 'cust1' })
      expect(ctx.state.result).toEqual(docs)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('createPlace', () => {
    it('injects customerId from params and creates', async () => {
      const body = { name: 'Casa' }
      ctx.params.customerId = 'cust1'
      ctx.request.body = body
      Place.create.mockResolvedValue(mockDoc)
      await createPlace(ctx, next)
      expect(Place.create).toHaveBeenCalledWith({ ...body, customerId: 'cust1' })
      expect(ctx.status).toBe(201)
      expect(ctx.state.result).toEqual(mockDoc)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('getPlace', () => {
    it('copies place to result', async () => {
      ctx.state.place = mockDoc
      await getPlace(ctx, next)
      expect(ctx.state.result).toBe(mockDoc)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('patchPlace', () => {
    it('updates place and sets result', async () => {
      const body = { name: 'Apartamento' }
      ctx.params.placeId = 'abc123'
      ctx.request.body = body
      Place.updateById.mockResolvedValue({ ...mockDoc, ...body })
      await patchPlace(ctx, next)
      expect(Place.updateById).toHaveBeenCalledWith('abc123', body)
      expect(ctx.state.result).toEqual({ ...mockDoc, ...body })
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('deletePlace', () => {
    it('deletes and sets 204', async () => {
      ctx.params.placeId = 'abc123'
      Place.deleteById.mockResolvedValue()
      await deletePlace(ctx, next)
      expect(Place.deleteById).toHaveBeenCalledWith('abc123')
      expect(ctx.status).toBe(204)
      expect(next).toHaveBeenCalledOnce()
    })
  })
})
