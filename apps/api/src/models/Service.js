import { MongoModel } from './_MongoModel.js'
import { SERVICE_STATUS_VALUES } from '@caramelo/enums'

export class Service extends MongoModel {
  static collectionName = 'services'

  static schema = {
    type: 'object',
    properties: {
      placeId: { type: 'string' },
      customerId: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      price: { type: 'number' },
      providerId: { type: 'string' },
      status: { type: 'string', enum: SERVICE_STATUS_VALUES },
    },
    required: ['placeId', 'customerId', 'name'],
  }
}
