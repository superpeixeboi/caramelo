export const WEEKDAYS = Object.freeze({
  SUNDAY: Object.freeze({ value: 'sunday', order: 0 }),
  MONDAY: Object.freeze({ value: 'monday', order: 1 }),
  TUESDAY: Object.freeze({ value: 'tuesday', order: 2 }),
  WEDNESDAY: Object.freeze({ value: 'wednesday', order: 3 }),
  THURSDAY: Object.freeze({ value: 'thursday', order: 4 }),
  FRIDAY: Object.freeze({ value: 'friday', order: 5 }),
  SATURDAY: Object.freeze({ value: 'saturday', order: 6 }),
  fromDate: function (date){
    if (date && date instanceof Date) {
      const dayOrder = date.getDay()
      return Object.values(this).find(day => day.order === dayOrder)
    }
  }
})

export const WEEKDAYS_VALUES = Object.freeze(
  Object.values(WEEKDAYS).map((e) => e.value)
)
