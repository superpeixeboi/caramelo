import { MongoModel } from '../db/MongoModel.js'
import { TICKET_FLOW_VALUES, TICKET_STATUS_VALUES, TICKET_STEP_STATUS_VALUES } from '@caramelo/enums'

export class Ticket extends MongoModel {
  static collectionName = 'tickets'

  static schema = {
    type: 'object',
    properties: {
      phone: { type: 'string' },
      flow: { type: 'string', enum: TICKET_FLOW_VALUES },
      status: { type: 'string', enum: TICKET_STATUS_VALUES },
      context: { type: 'object' },
      currentStepIndex: { type: 'integer', minimum: 0 },
      steps: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            stepId: { type: 'string' },
            prompt: { type: 'string' },
            response: { type: 'string' },
            data: { type: 'object' },
            status: { type: 'string', enum: TICKET_STEP_STATUS_VALUES },
          },
          required: ['stepId', 'status'],
        },
      },
    },
    required: ['phone', 'flow', 'status', 'currentStepIndex', 'steps'],
  }
}
