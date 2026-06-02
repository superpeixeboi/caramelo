import { vi, describe, it, expect, afterEach } from 'vitest'

process.env.API_BASE_URL = 'http://localhost:3000/api'

const {
  getTicket,
  createTicket,
  patchTicket,
  findCustomerByPhone,
  getCustomerPlaces,
  createService,
} = await import('../api.js')

function mockFetchOnce(status, body) {
  const response = {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  }
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
}

describe('api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('getTicket', () => {
    it('returns first ticket from response', async () => {
      mockFetchOnce(200, { data: [{ _id: 't1', phone: '5511999999999' }] })
      const result = await getTicket('5511999999999')
      expect(result).toEqual({ _id: 't1', phone: '5511999999999' })
    })

    it('returns null when no tickets', async () => {
      mockFetchOnce(200, { data: [] })
      const result = await getTicket('5511999999999')
      expect(result).toBeNull()
    })

    it('returns null on error', async () => {
      mockFetchOnce(500, 'Server error')
      const result = await getTicket('5511999999999')
      expect(result).toBeNull()
    })
  })

  describe('createTicket', () => {
    it('sends POST and returns created ticket', async () => {
      mockFetchOnce(201, { data: { _id: 't1' } })
      const result = await createTicket({ phone: '5511999999999' })
      expect(result).toEqual({ _id: 't1' })
    })
  })

  describe('patchTicket', () => {
    it('sends PATCH and returns updated ticket', async () => {
      mockFetchOnce(200, { data: { _id: 't1', status: 'closed' } })
      const result = await patchTicket('t1', { status: 'closed' })
      expect(result).toEqual({ _id: 't1', status: 'closed' })
    })
  })

  describe('findCustomerByPhone', () => {
    it('returns first customer from response', async () => {
      mockFetchOnce(200, { data: [{ _id: 'c1', phone: '5511999999999' }] })
      const result = await findCustomerByPhone('5511999999999')
      expect(result).toEqual({ _id: 'c1', phone: '5511999999999' })
    })

    it('returns null when not found', async () => {
      mockFetchOnce(200, { data: [] })
      const result = await findCustomerByPhone('5511999999999')
      expect(result).toBeNull()
    })
  })

  describe('getCustomerPlaces', () => {
    it('returns places array from response', async () => {
      mockFetchOnce(200, { data: [{ _id: 'p1', name: 'Casa' }] })
      const result = await getCustomerPlaces('c1')
      expect(result).toEqual([{ _id: 'p1', name: 'Casa' }])
    })

    it('returns empty array on error', async () => {
      mockFetchOnce(500, 'Error')
      const result = await getCustomerPlaces('c1')
      expect(result).toEqual([])
    })
  })

  describe('createService', () => {
    it('sends POST and returns created service', async () => {
      mockFetchOnce(201, { data: { _id: 'svc1' } })
      const result = await createService({ placeId: 'p1', customerId: 'c1', name: 'Limpeza' })
      expect(result).toEqual({ _id: 'svc1' })
    })
  })
})
