import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createMockCtx, createMockNext } from '../../test-helpers.js'

vi.mock('../../models/Provider.js', () => ({
  Provider: {
    findById: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
  },
}))

vi.mock('../../models/Service.js', () => ({
  Service: {
    findById: vi.fn(),
    find: vi.fn(),
    updateById: vi.fn(),
  },
}))

vi.mock('../../db/qsToMongo.js', () => ({
  qsToMongo: vi.fn((qs) => qs),
}))

import { Provider } from '../../models/Provider.js'
import { Service } from '../../models/Service.js'
import { qsToMongo } from '../../db/qsToMongo.js'
import { NotFoundError } from '../../lib/errors/NotFoundError.js'

const {
  fetchProvider,
  findProvider,
  createProvider,
  getProvider,
  patchProvider,
  deleteProvider,
  findProviderService,
  getProviderService,
  patchProviderService,
} = await import('../providerMiddleware.js')

const mockProvider = { _id: 'prov1', name: 'Clean Co' }
const mockService = { _id: 'svc1', name: 'Limpeza', providerId: 'prov1' }

describe('providerMiddleware', () => {
  let ctx
  const next = createMockNext()

  beforeEach(() => {
    vi.clearAllMocks()
    ctx = createMockCtx()
  })

  describe('fetchProvider', () => {
    it('sets provider on state and calls next', async () => {
      Provider.findById.mockResolvedValue(mockProvider)
      await fetchProvider('prov1', ctx, next)
      expect(Provider.findById).toHaveBeenCalledWith('prov1')
      expect(ctx.state.provider).toEqual(mockProvider)
      expect(next).toHaveBeenCalledOnce()
    })

    it('throws NotFoundError when provider not found', async () => {
      Provider.findById.mockResolvedValue(null)
      await expect(fetchProvider('prov1', ctx, next)).rejects.toThrow(NotFoundError)
    })
  })

  describe('findProvider', () => {
    it('sets result from Provider.find', async () => {
      const docs = [mockProvider]
      Provider.find.mockResolvedValue(docs)
      await findProvider(ctx, next)
      expect(qsToMongo).toHaveBeenCalledWith(ctx.query, Provider.schema)
      expect(Provider.find).toHaveBeenCalled()
      expect(ctx.state.result).toEqual(docs)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('createProvider', () => {
    it('sets status 201 and result from Provider.create', async () => {
      ctx.request.body = { name: 'Clean Co' }
      Provider.create.mockResolvedValue(mockProvider)
      await createProvider(ctx, next)
      expect(Provider.create).toHaveBeenCalledWith(ctx.request.body)
      expect(ctx.status).toBe(201)
      expect(ctx.state.result).toEqual(mockProvider)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('getProvider', () => {
    it('copies provider to result', async () => {
      ctx.state.provider = mockProvider
      await getProvider(ctx, next)
      expect(ctx.state.result).toBe(mockProvider)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('patchProvider', () => {
    it('updates provider and sets result', async () => {
      ctx.params.providerId = 'prov1'
      ctx.request.body = { name: 'Clean Co Ltda' }
      Provider.updateById.mockResolvedValue({ ...mockProvider, name: 'Clean Co Ltda' })
      await patchProvider(ctx, next)
      expect(Provider.updateById).toHaveBeenCalledWith('prov1', { name: 'Clean Co Ltda' })
      expect(ctx.state.result).toEqual({ ...mockProvider, name: 'Clean Co Ltda' })
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('deleteProvider', () => {
    it('deletes and sets 204', async () => {
      ctx.params.providerId = 'prov1'
      Provider.deleteById.mockResolvedValue()
      await deleteProvider(ctx, next)
      expect(Provider.deleteById).toHaveBeenCalledWith('prov1')
      expect(ctx.status).toBe(204)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('findProviderService', () => {
    it('sets result with providerId filter', async () => {
      const docs = [mockService]
      Service.find.mockResolvedValue(docs)
      ctx.params.providerId = 'prov1'
      await findProviderService(ctx, next)
      expect(qsToMongo).toHaveBeenCalledWith(ctx.query, Service.schema)
      expect(Service.find).toHaveBeenCalledWith({ ...ctx.query, providerId: 'prov1' })
      expect(ctx.state.result).toEqual(docs)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('getProviderService', () => {
    it('copies service to result', async () => {
      ctx.state.service = mockService
      await getProviderService(ctx, next)
      expect(ctx.state.result).toBe(mockService)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('patchProviderService', () => {
    it('updates service and sets result', async () => {
      ctx.params.serviceId = 'svc1'
      ctx.request.body = { status: 'accepted' }
      Service.updateById.mockResolvedValue({ ...mockService, status: 'accepted' })
      await patchProviderService(ctx, next)
      expect(Service.updateById).toHaveBeenCalledWith('svc1', { status: 'accepted' })
      expect(ctx.state.result).toEqual({ ...mockService, status: 'accepted' })
      expect(next).toHaveBeenCalledOnce()
    })
  })
})
