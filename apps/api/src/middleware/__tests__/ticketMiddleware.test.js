import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createMockCtx, createMockNext } from '../../test-helpers.js'

vi.mock('../../models/Ticket.js', () => ({
  Ticket: {
    findById: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    updateById: vi.fn(),
  },
}))

vi.mock('../../db/qsToMongo.js', () => ({
  qsToMongo: vi.fn((qs) => qs),
}))

import { Ticket } from '../../models/Ticket.js'
import { qsToMongo } from '../../db/qsToMongo.js'
import { NotFoundError } from '../../lib/errors/NotFoundError.js'

const {
  fetchTicket,
  findTicket,
  createTicket,
  getTicket,
  patchTicket,
} = await import('../ticketMiddleware.js')

const mockDoc = { _id: 'ticket1', phone: '5511999999999', flow: 'service-request', status: 'open' }

describe('ticketMiddleware', () => {
  let ctx
  const next = createMockNext()

  beforeEach(() => {
    vi.clearAllMocks()
    ctx = createMockCtx()
  })

  describe('fetchTicket', () => {
    it('sets ticket on state and calls next', async () => {
      Ticket.findById.mockResolvedValue(mockDoc)
      await fetchTicket('ticket1', ctx, next)
      expect(Ticket.findById).toHaveBeenCalledWith('ticket1')
      expect(ctx.state.ticket).toEqual(mockDoc)
      expect(next).toHaveBeenCalledOnce()
    })

    it('throws NotFoundError when ticket not found', async () => {
      Ticket.findById.mockResolvedValue(null)
      await expect(fetchTicket('ticket1', ctx, next)).rejects.toThrow(NotFoundError)
    })
  })

  describe('findTicket', () => {
    it('sets result from Ticket.find', async () => {
      const docs = [mockDoc]
      Ticket.find.mockResolvedValue(docs)
      ctx.query = { phone: '5511999999999', status: 'open' }
      await findTicket(ctx, next)
      expect(qsToMongo).toHaveBeenCalledWith(ctx.query, Ticket.schema)
      expect(Ticket.find).toHaveBeenCalledWith(ctx.query)
      expect(ctx.state.result).toEqual(docs)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('createTicket', () => {
    it('sets status 201 and result from Ticket.create', async () => {
      const body = { phone: '5511999999999', flow: 'service-request', status: 'open', currentStepIndex: 0, steps: [] }
      ctx.request.body = body
      Ticket.create.mockResolvedValue(mockDoc)
      await createTicket(ctx, next)
      expect(Ticket.create).toHaveBeenCalledWith(body)
      expect(ctx.status).toBe(201)
      expect(ctx.state.result).toEqual(mockDoc)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('getTicket', () => {
    it('copies ticket to result', async () => {
      ctx.state.ticket = mockDoc
      await getTicket(ctx, next)
      expect(ctx.state.result).toBe(mockDoc)
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('patchTicket', () => {
    it('updates ticket and sets result', async () => {
      const body = { status: 'closed' }
      ctx.params.ticketId = 'ticket1'
      ctx.request.body = body
      Ticket.updateById.mockResolvedValue({ ...mockDoc, ...body })
      await patchTicket(ctx, next)
      expect(Ticket.updateById).toHaveBeenCalledWith('ticket1', body)
      expect(ctx.state.result).toEqual({ ...mockDoc, ...body })
      expect(next).toHaveBeenCalledOnce()
    })
  })
})
