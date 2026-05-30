import { SERVICE_REQUEST } from './flows/serviceRequest.js'
import { getTicket, createTicket, patchTicket, findCustomerByPhone } from './api.js'
import { sendMessage } from './whatsapp.js'

const FLOWS = {
  'service-request': SERVICE_REQUEST,
}

export async function handleMessage(text, phone) {
  let ticket = await getTicket(phone)

  if (!ticket) {
    ticket = await startNewFlow(phone, 'service-request', text)
    return
  }

  await resolveCurrentStep(ticket, text)
}

async function startNewFlow(phone, flowKey, initialText) {
  const flow = FLOWS[flowKey]
  if (!flow) {
    console.error(`Unknown flow: ${flowKey}`)
    return
  }

  const steps = flow.steps.map((step, i) => ({
    stepId: step.id,
    prompt: i === 0 ? step.getPrompt(null) : '',
    response: '',
    data: null,
    status: i === 0 ? 'pending' : 'pending',
  }))

  const ticket = await createTicket({
    phone,
    flow: flowKey,
    status: 'open',
    context: {},
    currentStepIndex: 0,
    steps,
  })

  if (!ticket) {
    console.error('Failed to create ticket')
    return
  }

  if (flow.steps[0].type === 'text' && flow.steps[0].requiresCustomer) {
    const customer = await findCustomerByPhone(phone)
    if (!customer) {
      await sendMessage(phone, 'Você ainda não possui cadastro. Acesse caramelo.com/register')
      await patchTicket(ticket._id, { status: 'closed' })
      return
    }
    ticket.context.customer = customer
  }

  const prompt = flow.steps[0].getPrompt(ticket.context)
  await sendMessage(phone, prompt)

  const updatedSteps = [...ticket.steps]
  updatedSteps[0] = { ...updatedSteps[0], prompt }
  await patchTicket(ticket._id, { steps: updatedSteps })
}

async function resolveCurrentStep(ticket, text) {
  const flow = FLOWS[ticket.flow]
  if (!flow) {
    console.error(`Unknown flow for ticket: ${ticket.flow}`)
    return
  }

  const stepIdx = ticket.currentStepIndex
  const stepDef = flow.steps[stepIdx]
  if (!stepDef) {
    console.error(`No step definition for index ${stepIdx}`)
    return
  }

  const valid = stepDef.validate(text, ticket.context)
  if (!valid) {
    const errorMsg = stepDef.getErrorPrompt?.(ticket.context) || 'Resposta inválida. Tente novamente.'
    await sendMessage(ticket.phone, errorMsg)
    return
  }

  const parsed = stepDef.parse(text, ticket.context)
  const updatedSteps = [...ticket.steps]
  updatedSteps[stepIdx] = {
    ...updatedSteps[stepIdx],
    response: text,
    data: parsed,
    status: 'completed',
  }

  const newContext = { ...ticket.context, ...parsed }
  const nextIdx = stepIdx + 1

  if (nextIdx >= flow.steps.length) {
    await flow.onComplete(newContext, ticket.phone)
    updatedSteps[stepIdx] = { ...updatedSteps[stepIdx], response: text, data: parsed, status: 'completed' }
    await patchTicket(ticket._id, { steps: updatedSteps, context: newContext, status: 'closed' })
    return
  }

  const nextStep = flow.steps[nextIdx]

  if (nextStep.requiresCustomer && !newContext.customer) {
    const customer = await findCustomerByPhone(ticket.phone)
    if (!customer) {
      await sendMessage(ticket.phone, 'Você ainda não possui cadastro. Acesse caramelo.com/register')
      await patchTicket(ticket._id, { steps: updatedSteps, context: newContext, status: 'closed' })
      return
    }
    newContext.customer = customer
  }

  const prompt = nextStep.getPrompt(newContext)
  updatedSteps[nextIdx] = { ...updatedSteps[nextIdx], prompt, status: 'pending' }

  await patchTicket(ticket._id, {
    steps: updatedSteps,
    context: newContext,
    currentStepIndex: nextIdx,
  })

  await sendMessage(ticket.phone, prompt)
}
