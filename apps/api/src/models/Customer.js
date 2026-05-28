import { MongoModel } from './_MongoModel.js'

export class Customer extends MongoModel {
  static collectionName = 'customers'

  static schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
      phone: { type: 'string' },
    },
    required: ['name', 'email'],
  }
}
