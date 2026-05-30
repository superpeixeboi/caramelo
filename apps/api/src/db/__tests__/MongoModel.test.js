import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockObjectId = vi.hoisted(() => {
  return class MockObjectId {
    constructor(val) { this.val = val }
  }
})

vi.mock('mongodb', () => ({
  ObjectId: mockObjectId,
}))

const mockInsertOne = vi.hoisted(() => vi.fn())
const mockToArray = vi.hoisted(() => vi.fn())
const mockFind = vi.hoisted(() => vi.fn(() => ({ toArray: mockToArray })))
const mockFindOne = vi.hoisted(() => vi.fn())
const mockFindOneAndUpdate = vi.hoisted(() => vi.fn())
const mockDeleteOne = vi.hoisted(() => vi.fn())
const mockCollection = vi.hoisted(() => vi.fn(() => ({
  insertOne: mockInsertOne,
  find: mockFind,
  findOne: mockFindOne,
  findOneAndUpdate: mockFindOneAndUpdate,
  deleteOne: mockDeleteOne,
})))

vi.mock('../mongo.js', () => ({
  getDb: vi.fn(() => ({
    collection: mockCollection,
  })),
}))

import { MongoModel } from '../MongoModel.js'

class TestModel extends MongoModel {
  static collectionName = 'test_collection'
  static schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
    },
    required: ['name'],
  }
}

describe('MongoModel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('collection', () => {
    it('returns the db collection for collectionName', () => {
      const col = TestModel.collection
      expect(mockCollection).toHaveBeenCalledWith('test_collection')
    })
  })

  describe('create', () => {
    it('validates, inserts, and returns doc with timestamps', async () => {
      const data = { name: 'John', age: 30 }
      mockInsertOne.mockResolvedValue({ insertedId: 'new-id' })

      const result = await TestModel.create(data)

      expect(mockInsertOne).toHaveBeenCalledWith({
        name: 'John',
        age: 30,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
      expect(result._id).toBe('new-id')
      expect(result.name).toBe('John')
      expect(result.age).toBe(30)
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('throws ValidationError when required field is missing', async () => {
      const data = { age: 30 }

      await expect(TestModel.create(data)).rejects.toThrowError('Validation failed')
    })
  })

  describe('find', () => {
    it('calls find with query and opts and returns array', async () => {
      const docs = [{ name: 'John' }]
      mockToArray.mockResolvedValue(docs)

      const result = await TestModel.find({ name: 'John' }, { limit: 10 })

      expect(mockFind).toHaveBeenCalledWith({ name: 'John' }, { limit: 10 })
      expect(mockToArray).toHaveBeenCalledOnce()
      expect(result).toEqual(docs)
    })

    it('defaults to empty query and empty opts', async () => {
      mockToArray.mockResolvedValue([])

      await TestModel.find()

      expect(mockFind).toHaveBeenCalledWith({}, {})
    })
  })

  describe('findById', () => {
    it('calls findOne with ObjectId and returns doc', async () => {
      const doc = { _id: 'abc123', name: 'John' }
      mockFindOne.mockResolvedValue(doc)

      const result = await TestModel.findById('abc123')

      expect(mockFindOne).toHaveBeenCalledWith({ _id: expect.any(mockObjectId) })
      expect(result).toEqual(doc)
    })

    it('throws NotFoundError when doc not found', async () => {
      mockFindOne.mockResolvedValue(null)

      await expect(TestModel.findById('abc123')).rejects.toThrowError(
        'test_collection not found: abc123'
      )
    })
  })

  describe('updateById', () => {
    it('validates, calls findOneAndUpdate, and returns doc', async () => {
      const data = { name: 'Jane' }
      const updatedDoc = { _id: 'abc123', name: 'Jane', age: 25, updatedAt: new Date() }
      mockFindOneAndUpdate.mockResolvedValue(updatedDoc)

      const result = await TestModel.updateById('abc123', data)

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(mockObjectId) },
        { $set: { name: 'Jane', updatedAt: expect.any(Date) } },
        { returnDocument: 'after' }
      )
      expect(result).toEqual(updatedDoc)
    })

    it('throws NotFoundError when doc not found', async () => {
      mockFindOneAndUpdate.mockResolvedValue(null)

      await expect(TestModel.updateById('abc123', { name: 'Jane' })).rejects.toThrowError(
        'test_collection not found: abc123'
      )
    })

    it('throws ValidationError when data has wrong type', async () => {
      await expect(TestModel.updateById('abc123', { age: 'not-a-number' })).rejects.toThrowError(
        'Validation failed'
      )
    })
  })

  describe('deleteById', () => {
    it('calls deleteOne with ObjectId', async () => {
      mockDeleteOne.mockResolvedValue({ deletedCount: 1 })

      await TestModel.deleteById('abc123')

      expect(mockDeleteOne).toHaveBeenCalledWith({ _id: expect.any(mockObjectId) })
    })

    it('throws NotFoundError when nothing deleted', async () => {
      mockDeleteOne.mockResolvedValue({ deletedCount: 0 })

      await expect(TestModel.deleteById('abc123')).rejects.toThrowError(
        'test_collection not found: abc123'
      )
    })
  })
})
