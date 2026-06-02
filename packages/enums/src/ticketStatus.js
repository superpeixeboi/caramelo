export const TICKET_STATUS = Object.freeze({
  CREATING: Object.freeze({ value: 'creating' }),
  OPEN: Object.freeze({ value: 'open' }),
  CLOSED: Object.freeze({ value: 'closed' }),
})

export const TICKET_STATUS_VALUES = Object.freeze(
  Object.values(TICKET_STATUS).map((e) => e.value)
)
