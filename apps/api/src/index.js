import 'dotenv/config'
import { connect } from './db/mongo.js'
import { createApp } from './app.js'

const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://caramelo:caramelo@localhost:27017'

try {
  await connect(MONGODB_URI)
  console.log('connected to mongodb')
} catch (err) {
  console.error('failed to connect to mongodb:', err.message)
  process.exit(1)
}

const app = createApp()
app.listen(PORT, () => {
  console.log(`api listening on :${PORT}`)
})
