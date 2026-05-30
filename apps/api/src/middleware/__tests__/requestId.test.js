import { vi, describe, it, expect } from 'vitest'
import { createMockCtx } from '../../test-helpers.js'

vi.mock('../../lib/shortUuid.js', () => ({
  shortUuid: vi.fn(() => 'abc12345'),
}))

const { requestId } = await import('../requestId.js')

describe('requestId', () => {
  it('sets requestId on state and X-Request-Id header', async () => {
    const handler = requestId()
    const ctx = createMockCtx()
    const setSpy = vi.fn()
    ctx.set = setSpy
    const next = vi.fn()

    await handler(ctx, next)

    expect(ctx.state.requestId).toBe('abc12345')
    expect(setSpy).toHaveBeenCalledWith('X-Request-Id', 'abc12345')
    expect(next).toHaveBeenCalledOnce()
  })
})
