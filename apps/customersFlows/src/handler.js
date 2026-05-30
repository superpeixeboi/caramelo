import { parseWebhook, sendMessage } from './whatsapp.js'
import { handleMessage } from './ticketEngine.js'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

export const handler = async (event) => {
  if (event.requestContext?.http?.method === 'GET') {
    return handleVerify(event)
  }
  return handleIncoming(event)
}

function handleVerify(event) {
  const mode = event.queryStringParameters?.['hub.mode']
  const token = event.queryStringParameters?.['hub.verify_token']
  const challenge = event.queryStringParameters?.['hub.challenge']

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return { statusCode: 200, body: challenge }
  }

  return { statusCode: 403, body: 'Forbidden' }
}

async function handleIncoming(event) {
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
  const messages = parseWebhook(body)

  for (const msg of messages) {
    await handleMessage(msg.text, msg.phone)
  }

  return { statusCode: 200, body: 'OK' }
}
