import { MongoModel } from '../db/MongoModel.js'

export class Place extends MongoModel {
  static collectionName = 'places'

  static schema = {
    type: 'object',
    properties: {
      customerId: { type: 'string' },
      name: { type: 'string' },
      address: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
      zip: { type: 'string' },
    },
    required: ['customerId', 'name'],
  }
}
