import { getCustomerPlaces } from "../../api.js"
import { Step } from "../../step.js"

export class HelloStep extends Step {
  stepId = 'hello'
  async prompt() {
    return 'Olá, gostaria de agendar um serviço? (s para sim, n para não)'
  }
  async validate(input) {
    if (!['s', 'sim', 'n', 'não'].includes(input)) {
      return 'Responda apenas com "s" para sim ou "n" para não.'
    }
  }
  async process(input) {
    if (['s', 'sim'].includes(input)) return { customerId: this.customer._id }
    else throw new Error('ok, obrigado')
  }
}


export class PlaceStep extends Step {
  stepId = 'place'
  async prompt() {
    this.places = await getCustomerPlaces(this.customer._id)
    const list = this.places.reduce((text, place, idx) => text + `\n [${idx + 1}] para ${place.address}`, '')
    return 'Para qual localização? (digite o número correspondente)' + list
  }
  async validate(input) {
    this.places = await getCustomerPlaces(this.customer._id)
    if (isNaN(input) || parseInt(input) > this.places.length) {
      return 'Responda apenas com um dos números informados. (por exemplo "1" para o primeiro da lista)'
    }
  }
  async process(input) {
    const idx = parseInt(input) - 1
    const placeId = this.places[idx]._id
    return { placeId }
  }
}


export class DateStep extends Step {
  stepId = 'date'
  async prompt() {
    return 'Para qual dia? (digite o dia e mês no formado "dd/mm")'
  }
  async validate(input) {
    if (!ddmmRegex.test(input)) return 'Responda com a data no formato "dd/mm"'
    const date = parseDate(input)
    if (date.toString() === 'Invalid Date') return `A data ${input} não existe`
    if (date - new Date() > THIRTHY_DAYS) return `Ainda não abrimos a agenda para a data ${input}`
  }
  async process(input) {
    const date = parseDate(input)
    return { date }
  }
}


export class TimeStep extends Step {
  stepId = 'time'
  async prompt() {
    return 'Para qual horário? (digite um numero entre 9 e 17)'
  }
  async validate(input) {
    if (!numberRegex.test(input)) return 'Responda com um numero entre 9 e 17'
    const hour = parseInt(input)
    if (hour < 9 || hour > 17) return 'Responda com um numero entre 9 e 17'
  }
  async process(input) {
    const hours = parseInt(input)
    let originalDate = this.data.date
    const date = new Date(originalDate.getTime() + hours * ONE_HOUR)
    return { date }
  }
}


function parseDate(input) {
  const now = new Date()
  const [ dd, mm ] = input.split('/')
  let date = new Date(`${now.getFullYear()}-${mm}-${dd}`)
  if (date < now) date = new Date(`${now.getFullYear() + 1}-${mm}-${dd}`)
  return date
}
const ddmmRegex = new RegExp('^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$')
const numberRegex = /^\d+$/
const ONE_HOUR = 1000 * 60 * 60
const THIRTHY_DAYS = ONE_HOUR * 24 * 30
