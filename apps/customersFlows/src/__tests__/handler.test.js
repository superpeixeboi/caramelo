import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('../whatsapp.js', () => ({
  parseWebhook: vi.fn(),
  sendMessage: vi.fn(),
}))

vi.mock('../ticketEngine.js', () => ({
  handleMessage: vi.fn(),
}))

process.env.WHATSAPP_VERIFY_TOKEN = 'test-token'

const { handler } = await import('../handler.js')

describe('handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET — verification', () => {
    it('returns 200 with challenge on valid token', async () => {
      const event = {
        requestContext: { http: { method: 'GET' } },
        queryStringParameters: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'test-token',
          'hub.challenge': 'challenge123',
        },
      }

      const result = await handler(event)

      expect(result).toEqual({ statusCode: 200, body: 'challenge123' })
    })

    it('returns 403 on invalid token', async () => {
      const event = {
        requestContext: { http: { method: 'GET' } },
        queryStringParameters: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong-token',
          'hub.challenge': 'challenge123',
        },
      }

      const result = await handler(event)

      expect(result).toEqual({ statusCode: 403, body: 'Forbidden' })
    })
  })

  describe('POST — incoming messages', () => {
    it('parses webhook and calls handleMessage for each message', async () => {
      const { parseWebhook } = await import('../whatsapp.js')
      const { handleMessage } = await import('../ticketEngine.js')
      const messages = [
        { phone: '5511111111111', text: 'Olá' },
        { phone: '5522222222222', text: 'Sim' },
      ]
      parseWebhook.mockReturnValue(messages)

      const event = {
        requestContext: { http: { method: 'POST' } },
        body: JSON.stringify({ entry: [] }),
      }

      const result = await handler(event)

      expect(result).toEqual({ statusCode: 200, body: 'OK' })
      expect(parseWebhook).toHaveBeenCalledTimes(1)
      expect(handleMessage).toHaveBeenCalledTimes(2)
      expect(handleMessage).toHaveBeenCalledWith('Olá', '5511111111111')
      expect(handleMessage).toHaveBeenCalledWith('Sim', '5522222222222')
    })

    it('returns 200 when no messages in webhook', async () => {
      const { parseWebhook } = await import('../whatsapp.js')
      parseWebhook.mockReturnValue([])

      const event = {
        requestContext: { http: { method: 'POST' } },
        body: JSON.stringify({ entry: [] }),
      }

      const result = await handler(event)

      expect(result).toEqual({ statusCode: 200, body: 'OK' })
    })
  })
})
