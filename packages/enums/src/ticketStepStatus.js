export const TICKET_STEP_STATUS = Object.freeze({
  PENDING: Object.freeze({ value: 'pending' }),
  COMPLETED: Object.freeze({ value: 'completed' }),
  FAILED: Object.freeze({ value: 'failed' }),
})

export const TICKET_STEP_STATUS_VALUES = Object.freeze(
  Object.values(TICKET_STEP_STATUS).map((e) => e.value)
)
