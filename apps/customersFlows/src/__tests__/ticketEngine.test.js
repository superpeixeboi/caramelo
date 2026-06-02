import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockCustomer = vi.hoisted(() => ({
  _id: 'cust1', name: 'John', phone: '5511999999999', email: 'john@test.com',
}))

const mockTicket = vi.hoisted(() => ({
  _id: 'ticket1', phone: '5511999999999', flowId: 'service-request',
  status: 'open', data: {}, currentStepIndex: 0, steps: [],
}))

vi.mock('../api.js', () => ({
  findCustomerByPhone: vi.fn(),
  getTicket: vi.fn(),
  createTicket: vi.fn(),
  patchTicket: vi.fn(),
  getCustomerPlaces: vi.fn(),
  createService: vi.fn(),
}))

vi.mock('../whatsapp.js', () => ({
  sendMessage: vi.fn(),
}))

const { handleMessage } = await import('../ticketEngine.js')

describe('ticketEngine', () => {
  let api
  let whatsapp

  beforeEach(async () => {
    vi.clearAllMocks()
    api = await import('../api.js')
    whatsapp = await import('../whatsapp.js')
  })

  describe('handleMessage', () => {
    it('sends registration message when customer not found', async () => {
      api.findCustomerByPhone.mockResolvedValue(null)

      await handleMessage('Olá', '5511999999999')

      expect(whatsapp.sendMessage).toHaveBeenCalledWith(
        '5511999999999',
        expect.stringContaining('cadastro')
      )
      expect(api.createTicket).not.toHaveBeenCalled()
    })

    it('creates ticket and sends first prompt when no open ticket', async () => {
      api.findCustomerByPhone.mockResolvedValue(mockCustomer)
      api.getTicket.mockResolvedValue(null)
      api.createTicket.mockResolvedValue(mockTicket)

      await handleMessage('Olá', '5511999999999')

      expect(api.createTicket).toHaveBeenCalledWith({
        phone: '5511999999999',
        flowId: 'service-request',
        status: 'open',
        data: {},
        currentStepIndex: 0,
        steps: [],
      })
      expect(whatsapp.sendMessage).toHaveBeenCalledWith(
        '5511999999999',
        expect.any(String)
      )
    })

    it('resolves current step when open ticket exists', async () => {
      const ticket = {
        _id: 'ticket1', phone: '5511999999999', flowId: 'service-request',
        status: 'open', data: {}, currentStepIndex: 0, steps: [],
      }
      api.findCustomerByPhone.mockResolvedValue(mockCustomer)
      api.getTicket.mockResolvedValue(ticket)
      api.patchTicket.mockResolvedValue({ ...ticket, currentStepIndex: 1 })
      api.getCustomerPlaces.mockResolvedValue([])

      await handleMessage('s', '5511999999999')

      expect(api.patchTicket).toHaveBeenCalled()
      expect(whatsapp.sendMessage).toHaveBeenCalledWith(
        '5511999999999',
        expect.any(String)
      )
    })

    it('sends error message when step validation fails', async () => {
      const ticket = {
        _id: 'ticket1', phone: '5511999999999', flowId: 'service-request',
        status: 'open', data: {}, currentStepIndex: 0, steps: [],
      }
      api.findCustomerByPhone.mockResolvedValue(mockCustomer)
      api.getTicket.mockResolvedValue(ticket)

      await handleMessage('xzy', '5511999999999')

      expect(whatsapp.sendMessage).toHaveBeenCalledWith(
        '5511999999999',
        expect.any(Error)
      )
      expect(api.patchTicket).not.toHaveBeenCalled()
    })

    it('completes flow and closes ticket on last step', async () => {
      const ticket = {
        _id: 'ticket1', phone: '5511999999999', flowId: 'service-request',
        status: 'open', data: { date: new Date('2025-06-15T10:00:00Z') },
        currentStepIndex: 3, steps: [],
      }
      api.findCustomerByPhone.mockResolvedValue(mockCustomer)
      api.getTicket.mockResolvedValue(ticket)
      api.patchTicket.mockResolvedValue(ticket)
      api.createService.mockResolvedValue({ _id: 'svc1' })

      await handleMessage('10', '5511999999999')

      expect(api.patchTicket).toHaveBeenCalledWith(
        'ticket1',
        expect.objectContaining({ status: 'closed' })
      )
      expect(whatsapp.sendMessage).toHaveBeenCalledWith(
        '5511999999999',
        expect.any(String)
      )
    })

    it('handles createTicket failure gracefully', async () => {
      api.findCustomerByPhone.mockResolvedValue(mockCustomer)
      api.getTicket.mockResolvedValue(null)
      api.createTicket.mockResolvedValue(null)

      await handleMessage('Olá', '5511999999999')

      expect(whatsapp.sendMessage).not.toHaveBeenCalled()
    })
  })
})
