import { vi, describe, it, expect } from 'vitest'
import { createMockCtx } from '../../test-helpers.js'

const { requestLogger } = await import('../requestLogger.js')

describe('requestLogger', () => {
  it('logs request and response and calls next', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const handler = requestLogger()
    const ctx = createMockCtx({
      request: { method: 'GET', path: '/health' },
      state: { requestId: 'abc123' },
    })
    const next = vi.fn()

    await handler(ctx, next)

    expect(consoleSpy).toHaveBeenCalledTimes(3)
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[abc123] → GET /health'))
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[abc123] ← 200'))
    expect(next).toHaveBeenCalledOnce()

    consoleSpy.mockRestore()
  })
})
