import { vi } from 'vitest'

export function createMockCtx(overrides = {}) {
  return {
    state: {},
    params: {},
    request: { body: {} },
    query: {},
    status: 200,
    set: () => {},
    ...overrides,
  }
}

export function createMockNext() {
  return vi.fn()
}
