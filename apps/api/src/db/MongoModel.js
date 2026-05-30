import { ObjectId } from 'mongodb'
import Ajv from 'ajv'
import { getDb } from './mongo.js'
import { ValidationError } from '../lib/errors/ValidationError.js'
import { NotFoundError } from '../lib/errors/NotFoundError.js'

export class MongoModel {
  static get collection() {
    return getDb().collection(this.collectionName)
  }

  static async create(data) {
    const { create: validate } = loadValidatorsFor(this)
    if (!validate(data)) {
      throw new ValidationError(validate.errors)
    }
    const now = new Date()
    const doc = { ...data, createdAt: now, updatedAt: now }
    const result = await this.collection.insertOne(doc)
    return { _id: result.insertedId, ...doc }
  }

  static async find(query = {}, opts = {}) {
    return this.collection.find(query, opts).toArray()
  }

  static async findById(id) {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) })
    if (!doc) throw new NotFoundError(this.collectionName, id)
    return doc
  }

  static async updateById(id, data) {
    const { update: validate } = loadValidatorsFor(this)
    if (!validate(data)) {
      throw new ValidationError(validate.errors)
    }
    const doc = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    if (!doc) throw new NotFoundError(this.collectionName, id)
    return doc
  }

  static async deleteById(id) {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) throw new NotFoundError(this.collectionName, id)
  }
}

const ajv = new Ajv({ removeAdditional: true, useDefaults: true })
const validatorsMap = new WeakMap()

function loadValidatorsFor(subclass) {
  let cache = validatorsMap.get(subclass)
  if (!cache) {
    const create = ajv.compile(subclass.schema)
    const update = ajv.compile({ ...subclass.schema, required: undefined })
    cache = { create, update }
    validatorsMap.set(subclass, cache)
  }
  return cache
}
