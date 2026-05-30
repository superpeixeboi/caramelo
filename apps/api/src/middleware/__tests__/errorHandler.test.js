import { vi, describe, it, expect } from 'vitest'
import { createMockCtx, createMockNext } from '../../test-helpers.js'

const { errorHandler } = await import('../errorHandler.js')

describe('errorHandler', () => {
  it('calls next and passes through when no error', async () => {
    const handler = errorHandler()
    const ctx = createMockCtx()
    const next = vi.fn()

    await handler(ctx, next)

    expect(next).toHaveBeenCalledOnce()
  })

  it('catches error with status and sets body', async () => {
    const handler = errorHandler()
    const ctx = createMockCtx()
    const next = vi.fn().mockRejectedValue({ status: 422, message: 'Validation failed', details: [{ message: 'name is required' }] })

    await handler(ctx, next)

    expect(ctx.status).toBe(422)
    expect(ctx.body).toEqual({
      error: 'Validation failed',
      details: [{ message: 'name is required' }],
    })
  })

  it('masks error message for 500', async () => {
    const handler = errorHandler()
    const ctx = createMockCtx()
    const next = vi.fn().mockRejectedValue(new Error('Something sensitive'))

    await handler(ctx, next)

    expect(ctx.status).toBe(500)
    expect(ctx.body).toEqual({ error: 'Internal server error' })
  })

  it('defaults to 500 for errors without status', async () => {
    const handler = errorHandler()
    const ctx = createMockCtx()
    const next = vi.fn().mockRejectedValue({ message: 'Oops' })

    await handler(ctx, next)

    expect(ctx.status).toBe(500)
    expect(ctx.body).toEqual({ error: 'Internal server error' })
  })
})
