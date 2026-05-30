import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createMockCtx, createMockNext } from '../../test-helpers.js'

vi.mock('../../models/Service.js', () => ({
  Service: {
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

import { Service } from '../../models/Service.js'
import { qsToMongo } from '../../db/qsToMongo.js'
import { NotFoundError } from '../../lib/errors/NotFoundError.js'

const {
  fetchService,
  findService,
  createService,
  getService,
  patchService,
  deleteService,
} = await import('../serviceMiddleware.js')

const mockDoc = { _id: 'abc123', name: 'Limpeza', placeId: 'place1', customerId: 'cust1' }

describe('serviceMiddleware', () => {
  let ctx
  const next = createMockNext()

  beforeEach(() => {
    vi.clearAllMocks()
    ctx = createMockCtx()
  })

  describe('fetchService', () => {
    it('sets service on state and calls next', async () => {
      Service.findById.mockResolvedValue(mockDoc)
      await fetchService('abc123', ctx, next)
      expect(Service.findById).toHaveBeenCalledWith('abc123')
      expect(ctx.state.service).toEqual(mockDoc)
      expect(next).toHaveBeenCalledOnce()
    })

    it('throws NotFoundError when service not found', async () => {
      Service.findById.mockResolvedValue(null)
      await expect(fetchService('abc123', ctx, next)).rejects.toThrow(NotFoundError)
    })
  })

  describe('findService', () => {
    it('sets result with placeId filter', async () => {
      const docs = [mockDoc]
      Service.find.mockResolvedValue(docs)
      ctx.params.placeId = 'place1'
      ctx.query = { name: 'Limpeza' }
      await findService(ctx, next)
      expect(qsToMongo).toHaveBeenCalledWith(ctx.query, Service.schema)
      expect(Service.find).toHaveBeenCalledWith({ ...ctx.query, placeId: 'place1' })
      expect(ctx.state.result).toEqual(docs)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('createService', () => {
    it('injects customerId and placeId from params and creates', async () => {
      const body = { name: 'Limpeza' }
      ctx.params.customerId = 'cust1'
      ctx.params.placeId = 'place1'
      ctx.request.body = body
      Service.create.mockResolvedValue(mockDoc)
      await createService(ctx, next)
      expect(Service.create).toHaveBeenCalledWith({ ...body, customerId: 'cust1', placeId: 'place1' })
      expect(ctx.status).toBe(201)
      expect(ctx.state.result).toEqual(mockDoc)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('getService', () => {
    it('copies service to result', async () => {
      ctx.state.service = mockDoc
      await getService(ctx, next)
      expect(ctx.state.result).toBe(mockDoc)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('patchService', () => {
    it('updates service and sets result', async () => {
      const body = { name: 'Limpeza Pesada' }
      ctx.params.serviceId = 'abc123'
      ctx.request.body = body
      Service.updateById.mockResolvedValue({ ...mockDoc, ...body })
      await patchService(ctx, next)
      expect(Service.updateById).toHaveBeenCalledWith('abc123', body)
      expect(ctx.state.result).toEqual({ ...mockDoc, ...body })
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('deleteService', () => {
    it('deletes and sets 204', async () => {
      ctx.params.serviceId = 'abc123'
      Service.deleteById.mockResolvedValue()
      await deleteService(ctx, next)
      expect(Service.deleteById).toHaveBeenCalledWith('abc123')
      expect(ctx.status).toBe(204)
      expect(next).toHaveBeenCalledOnce()
    })
  })
})
