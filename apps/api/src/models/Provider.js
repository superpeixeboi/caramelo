import { MongoModel } from '../db/MongoModel.js'

export class Provider extends MongoModel {
  static collectionName = 'providers'

  static schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
      phone: { type: 'string' },
      address: { type: 'string' },
      zip: { type: 'string' },
      coordinates: {
        type: 'object',
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' },
        },
        additionalProperties: false,
      },
      availability: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            day: { type: 'string' },
            start: { type: 'string' },
            end: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
    },
    required: ['name', 'email'],
  }
}
