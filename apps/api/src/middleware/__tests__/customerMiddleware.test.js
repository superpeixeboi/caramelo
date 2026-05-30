import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createMockCtx, createMockNext } from '../../test-helpers.js'

vi.mock('../../models/Customer.js', () => ({
  Customer: {
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

import { Customer } from '../../models/Customer.js'
import { qsToMongo } from '../../db/qsToMongo.js'
import { NotFoundError } from '../../lib/errors/NotFoundError.js'

const {
  fetchCustomer,
  findCustomer,
  createCustomer,
  getCustomer,
  patchCustomer,
  deleteCustomer,
} = await import('../customerMiddleware.js')

const mockDoc = { _id: 'abc123', name: 'John', email: 'john@test.com' }

describe('customerMiddleware', () => {
  let ctx
  const next = createMockNext()

  beforeEach(() => {
    vi.clearAllMocks()
    ctx = createMockCtx()
  })

  describe('fetchCustomer', () => {
    it('sets customer on state and calls next', async () => {
      Customer.findById.mockResolvedValue(mockDoc)
      await fetchCustomer('abc123', ctx, next)
      expect(Customer.findById).toHaveBeenCalledWith('abc123')
      expect(ctx.state.customer).toEqual(mockDoc)
      expect(next).toHaveBeenCalledOnce()
    })

    it('throws NotFoundError when customer not found', async () => {
      Customer.findById.mockResolvedValue(null)
      await expect(fetchCustomer('abc123', ctx, next)).rejects.toThrow(NotFoundError)
    })
  })

  describe('findCustomer', () => {
    it('sets result from Customer.find with qsToMongo filter', async () => {
      const docs = [mockDoc]
      Customer.find.mockResolvedValue(docs)
      ctx.query = { name: 'John' }
      await findCustomer(ctx, next)
      expect(qsToMongo).toHaveBeenCalledWith(ctx.query, Customer.schema)
      expect(Customer.find).toHaveBeenCalledWith(ctx.query)
      expect(ctx.state.result).toEqual(docs)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('createCustomer', () => {
    it('sets status 201 and result from Customer.create', async () => {
      const body = { name: 'John', email: 'john@test.com' }
      ctx.request.body = body
      Customer.create.mockResolvedValue(mockDoc)
      await createCustomer(ctx, next)
      expect(Customer.create).toHaveBeenCalledWith(body)
      expect(ctx.status).toBe(201)
      expect(ctx.state.result).toEqual(mockDoc)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('getCustomer', () => {
    it('copies customer to result', async () => {
      ctx.state.customer = mockDoc
      await getCustomer(ctx, next)
      expect(ctx.state.result).toBe(mockDoc)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('patchCustomer', () => {
    it('updates customer and sets result', async () => {
      const body = { name: 'Jane' }
      ctx.params.customerId = 'abc123'
      ctx.request.body = body
      Customer.updateById.mockResolvedValue({ ...mockDoc, ...body })
      await patchCustomer(ctx, next)
      expect(Customer.updateById).toHaveBeenCalledWith('abc123', body)
      expect(ctx.state.result).toEqual({ ...mockDoc, ...body })
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('deleteCustomer', () => {
    it('deletes and sets 204', async () => {
      ctx.params.customerId = 'abc123'
      Customer.deleteById.mockResolvedValue()
      await deleteCustomer(ctx, next)
      expect(Customer.deleteById).toHaveBeenCalledWith('abc123')
      expect(ctx.status).toBe(204)
      expect(next).toHaveBeenCalledOnce()
    })
  })
})
