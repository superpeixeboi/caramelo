import { MongoClient } from 'mongodb'

const URI = process.env.MONGODB_URI || 'mongodb://caramelo:caramelo@localhost:27017'
const MAX_RETRIES = 30
const RETRY_INTERVAL = 1000

let attempt = 0

while (attempt < MAX_RETRIES) {
  attempt++
  try {
    const client = new MongoClient(URI, { serverSelectionTimeoutMS: 2000 })
    await client.connect()
    await client.close()
    console.log('mongo is ready')
    process.exit(0)
  } catch {
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_INTERVAL))
    }
  }
}

console.error('mongo did not become ready in time')
process.exit(1)
