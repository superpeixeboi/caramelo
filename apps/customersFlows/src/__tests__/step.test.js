import { vi, describe, it, expect } from 'vitest'

const { Step } = await import('../step.js')

describe('Step', () => {
  describe('constructor', () => {
    it('throws when customer is missing', () => {
      expect(() => new Step({ data: {} })).toThrow('Customer is missing')
    })

    it('sets ctx, data, and customer', () => {
      const customer = { _id: 'c1', phone: '5511999999999' }
      const data = { key: 'value' }
      const step = new Step({ customer, data })

      expect(step.ctx).toEqual({ customer, data })
      expect(step.data).toBe(data)
      expect(step.customer).toBe(customer)
    })
  })

  describe('run', () => {
    class TestStep extends Step {
      stepId = 'test-step'
      async prompt() { return 'Test prompt' }
      async validate(input) {
        if (input === 'valid') return undefined
        return 'Invalid input'
      }
      async process(input) {
        return { result: input }
      }
    }

    it('returns stepId, prompt, input, and data on success', async () => {
      const customer = { _id: 'c1' }
      const step = new TestStep({ customer, data: {} })

      const result = await step.run('valid')

      expect(result).toEqual({
        stepId: 'test-step',
        prompt: 'Test prompt',
        input: 'valid',
        data: { result: 'valid' },
      })
    })

    it('throws when validation fails', async () => {
      const customer = { _id: 'c1' }
      const step = new TestStep({ customer, data: {} })

      await expect(step.run('invalid')).rejects.toThrow('Invalid input')
    })
  })

  describe('abstract methods', () => {
    it('prompt throws by default', async () => {
      const customer = { _id: 'c1' }
      const step = new Step({ customer, data: {} })
      await expect(step.prompt()).rejects.toThrow('not implemented')
    })

    it('validate throws by default', async () => {
      const customer = { _id: 'c1' }
      const step = new Step({ customer, data: {} })
      await expect(step.validate('x')).rejects.toThrow('not implemented')
    })

    it('process throws by default', async () => {
      const customer = { _id: 'c1' }
      const step = new Step({ customer, data: {} })
      await expect(step.process('x')).rejects.toThrow('not implemented')
    })
  })
})
