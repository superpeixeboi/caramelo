import { vi, describe, it, expect } from 'vitest'

process.env.WHATSAPP_PHONE_NUMBER_ID = '123456'
process.env.WHATSAPP_ACCESS_TOKEN = 'test-token'

const { sendMessage, parseWebhook } = await import('../whatsapp.js')

describe('whatsapp', () => {
  describe('sendMessage', () => {
    it('calls fetch with correct URL and body', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true })
      vi.stubGlobal('fetch', mockFetch)

      await sendMessage('5511999999999', 'Hello')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/v22.0/123456/messages',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '5511999999999',
            type: 'text',
            text: { body: 'Hello' },
          }),
        })
      )
      vi.unstubAllGlobals()
    })

    it('logs error when fetch fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('API Error'),
      })
      vi.stubGlobal('fetch', mockFetch)

      await sendMessage('5511999999999', 'Hello')

      expect(consoleSpy).toHaveBeenCalledWith('WhatsApp send error:', 'API Error')
      consoleSpy.mockRestore()
      vi.unstubAllGlobals()
    })
  })

  describe('parseWebhook', () => {
    it('extracts text messages from webhook payload', () => {
      const body = {
        entry: [
          {
            changes: [
              {
                field: 'messages',
                value: {
                  messages: [
                    {
                      from: '5511111111111',
                      type: 'text',
                      text: { body: 'Olá' },
                    },
                    {
                      from: '5522222222222',
                      type: 'text',
                      text: { body: 'Sim' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      }

      const result = parseWebhook(body)

      expect(result).toEqual([
        { phone: '5511111111111', text: 'Olá' },
        { phone: '5522222222222', text: 'Sim' },
      ])
    })

    it('skips non-text messages', () => {
      const body = {
        entry: [
          {
            changes: [
              {
                field: 'messages',
                value: {
                  messages: [
                    {
                      from: '5511111111111',
                      type: 'image',
                      image: { id: 'img1' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      }

      const result = parseWebhook(body)

      expect(result).toEqual([])
    })

    it('returns empty array for empty entry', () => {
      expect(parseWebhook({ entry: [] })).toEqual([])
    })

    it('handles missing entry gracefully', () => {
      expect(parseWebhook({})).toEqual([])
    })
  })
})
