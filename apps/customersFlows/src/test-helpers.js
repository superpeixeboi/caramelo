export function createMockCustomer(overrides = {}) {
  return {
    _id: 'cust1',
    name: 'John',
    phone: '5511999999999',
    email: 'john@test.com',
    ...overrides,
  }
}

export function createMockTicket(overrides = {}) {
  return {
    _id: 'ticket1',
    phone: '5511999999999',
    flowId: 'service-request',
    status: 'open',
    data: {},
    currentStepIndex: 0,
    steps: [],
    ...overrides,
  }
}

export function createMockStepResult(overrides = {}) {
  return {
    stepId: 'test-step',
    prompt: 'Test prompt',
    input: 'test input',
    data: { key: 'value' },
    ...overrides,
  }
}
