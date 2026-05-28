import { MongoClient } from 'mongodb'

let client
let db

export async function connect(uri) {
  if (client) return client

  client = new MongoClient(uri)
  await client.connect()
  db = client.db()
  return client
}

export function getDb() {
  if (!db) {
    throw new Error('Database not connected. Call connect() first.')
  }
  return db
}
