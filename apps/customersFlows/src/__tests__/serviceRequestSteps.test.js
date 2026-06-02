import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'

vi.mock('../api.js', () => ({
  getCustomerPlaces: vi.fn(),
}))

process.env.API_BASE_URL = 'http://localhost:3000/api'

const { HelloStep, PlaceStep, DateStep, TimeStep } = await import('../flows/serviceRequest/serviceRequestSteps.js')

describe('HelloStep', () => {
  const customer = { _id: 'c1', phone: '5511999999999' }
  let step

  beforeEach(() => {
    vi.clearAllMocks()
    step = new HelloStep({ customer, data: {} })
  })

  it('prompt returns greeting', async () => {
    const text = await step.prompt()
    expect(text).toContain('agendar')
  })

  it('validate returns undefined for valid input', async () => {
    expect(await step.validate('s')).toBeUndefined()
    expect(await step.validate('sim')).toBeUndefined()
    expect(await step.validate('n')).toBeUndefined()
    expect(await step.validate('não')).toBeUndefined()
  })

  it('validate returns error for invalid input', async () => {
    const err = await step.validate('x')
    expect(err).toContain('Responda')
  })

  it('process returns customerId on sim', async () => {
    const result = await step.process('s')
    expect(result).toEqual({ customerId: 'c1' })
  })

  it('process throws on nao', async () => {
    await expect(step.process('n')).rejects.toThrow('obrigado')
  })
})

describe('PlaceStep', () => {
  const customer = { _id: 'c1', phone: '5511999999999' }
  let step
  let api

  beforeEach(async () => {
    vi.clearAllMocks()
    api = await import('../api.js')
    step = new PlaceStep({ customer, data: {} })
  })

  it('prompt fetches places and builds list', async () => {
    api.getCustomerPlaces.mockResolvedValue([
      { _id: 'p1', name: 'Casa', address: 'Rua A' },
      { _id: 'p2', name: 'Escritório', address: 'Rua B' },
    ])

    const text = await step.prompt()

    expect(text).toContain('1')
    expect(text).toContain('Rua A')
    expect(text).toContain('2')
    expect(text).toContain('Rua B')
  })

  it('validate returns undefined for a valid index', async () => {
    api.getCustomerPlaces.mockResolvedValue([
      { _id: 'p1', name: 'Casa', address: 'Rua A' },
    ])

    const err = await step.validate('1')
    expect(err).toBeUndefined()
  })

  it('validate returns error for out-of-range index', async () => {
    api.getCustomerPlaces.mockResolvedValue([
      { _id: 'p1', name: 'Casa', address: 'Rua A' },
    ])

    const err = await step.validate('5')
    expect(err).toContain('Responda')
  })

  it('process returns placeId', async () => {
    api.getCustomerPlaces.mockResolvedValue([
      { _id: 'p1', name: 'Casa', address: 'Rua A' },
      { _id: 'p2', name: 'Escritório', address: 'Rua B' },
    ])
    await step.validate('2')

    const result = await step.process('2')
    expect(result).toEqual({ placeId: 'p2' })
  })
})

describe('DateStep', () => {
  const customer = { _id: 'c1', phone: '5511999999999' }
  let step

  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  beforeEach(() => {
    step = new DateStep({ customer, data: {} })
  })

  it('prompt asks for date', async () => {
    const text = await step.prompt()
    expect(text).toContain('dd/mm')
  })

  it('validate returns error for invalid format', async () => {
    const err = await step.validate('abc')
    expect(err).toContain('formato')
  })

  it('process returns a date object', async () => {
    const result = await step.process('20/01')
    expect(result.date).toBeInstanceOf(Date)
  })
})

describe('TimeStep', () => {
  const customer = { _id: 'c1', phone: '5511999999999' }
  let step

  beforeEach(() => {
    step = new TimeStep({
      customer,
      data: { date: new Date('2025-01-20T10:00:00Z') },
    })
  })

  it('prompt asks for time', async () => {
    const text = await step.prompt()
    expect(text).toContain('horário')
  })

  it('validate returns error for non-numeric input', async () => {
    const err = await step.validate('abc')
    expect(err).toContain('numero')
  })

  it('validate returns error for hour below 9', async () => {
    const err = await step.validate('8')
    expect(err).toContain('numero')
  })

  it('validate returns error for hour above 17', async () => {
    const err = await step.validate('18')
    expect(err).toContain('numero')
  })

  it('validate returns undefined for valid hour', async () => {
    const err = await step.validate('10')
    expect(err).toBeUndefined()
  })

  it('process adds hours to date', async () => {
    const result = await step.process('14')
    expect(result.date).toBeInstanceOf(Date)
    expect(result.date.getUTCHours()).toBe(0)
    expect(result.date.getUTCDate()).toBe(21)
  })
})
