export const SERVICE_STATUS = Object.freeze({
  PENDING: Object.freeze({ value: 'pending' }),
  ACCEPTED: Object.freeze({ value: 'accepted' }),
})

export const SERVICE_STATUS_VALUES = Object.freeze(
  Object.values(SERVICE_STATUS).map((e) => e.value)
)
