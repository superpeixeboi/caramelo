import { serviceRequestFlow } from './flows/serviceRequest/serviceRequestFlow.js'
import { getTicket, createTicket, patchTicket, findCustomerByPhone } from './api.js'
import { sendMessage } from './whatsapp.js'

export async function handleMessage(input, phone) {
  const customer = await findCustomerByPhone(phone)
  if (!customer) {
    return sendMessage(phone, 'Você ainda não possui cadastro. Acesse caramelo.com/register')
  }

  const ticket = await getTicket(phone)
  if (!ticket) {
    return startNewFlow(phone, serviceRequestFlow, customer)
  }

  return resolveCurrentStep(ticket, input, serviceRequestFlow, customer)
}

async function startNewFlow(phone, flow, customer) {
  const data = {}
  
  const ticket = await createTicket({
    phone,
    flowId: flow.flowId,
    status: 'open',
    data: {},
    currentStepIndex: 0,
    steps: []
  })

  if (!ticket) {
    console.error('Failed to create ticket')
    return
  }

  const FirstStep = flow.steps[0]
  const prompt = await new FirstStep({ customer, data }).prompt()
  return sendMessage(phone, prompt)
}

async function resolveCurrentStep(ticket, input, flow, customer) {
  const stepIdx = ticket.currentStepIndex
  const nextStepIdx = stepIdx + 1
  const CurrStep = flow.steps[stepIdx]
  let step
  try {
    const currStep = new CurrStep({ customer, data: ticket.data })
    step = await currStep.run(input)
  } catch (error) {
    return sendMessage(ticket.phone, error)
  }

  const steps = [ ...ticket.steps, step ]
  const data = { ...ticket.data, ...step.data }
  const status = flow.steps[nextStepIdx] ? 'open' : 'closed'
  await patchTicket(ticket._id, { currentStepIndex: nextStepIdx, data, steps, status })

  if (status === 'open') {
    const NextStep = flow.steps[nextStepIdx]
    const nextStep = new NextStep({ customer, data })
    const prompt = await nextStep.prompt()
    return sendMessage(ticket.phone, prompt)
  } else {
    const prompt = await flow.onComplete(data)
    return sendMessage(ticket.phone, prompt)
  }
}
