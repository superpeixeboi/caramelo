import { createService } from '../../api.js'
import { sendMessage } from '../../whatsapp.js'
import { DateStep, HelloStep, PlaceStep, TimeStep } from './serviceRequestSteps.js'

export const SERVICE_REQUEST = 'service-request'

export const serviceRequestFlow = {
  flowId: SERVICE_REQUEST,
  steps: [HelloStep, PlaceStep, DateStep, TimeStep],
  onComplete: async (data) => {
    await createService(data)
    return 'Sua solicitação está registrada. Entraremos em contato em breve.'
  }
}
