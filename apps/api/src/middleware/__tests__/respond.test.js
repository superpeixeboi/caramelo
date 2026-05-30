import { vi, describe, it, expect } from 'vitest'
import { createMockCtx, createMockNext } from '../../test-helpers.js'

const { respond } = await import('../respond.js')

describe('respond', () => {
  it('sets ctx.body from ctx.state.result', async () => {
    const handler = respond()
    const ctx = createMockCtx()
    const result = { id: 'abc', name: 'test' }
    ctx.state.result = result
    const next = vi.fn()

    await handler(ctx, next)

    expect(ctx.body).toBe(result)
    expect(next).toHaveBeenCalledOnce()
  })

  it('does not set body when result is null', async () => {
    const handler = respond()
    const ctx = createMockCtx()
    ctx.state.result = null
    const next = vi.fn()

    await handler(ctx, next)

    expect(ctx.body).toBeUndefined()
    expect(next).toHaveBeenCalledOnce()
  })

  it('does not set body when result is undefined', async () => {
    const handler = respond()
    const ctx = createMockCtx()
    const next = vi.fn()

    await handler(ctx, next)

    expect(ctx.body).toBeUndefined()
    expect(next).toHaveBeenCalledOnce()
  })
})
