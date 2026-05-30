const API_VERSION = 'v22.0'
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

export async function sendMessage(to, text) {
  const url = `${BASE_URL}/${PHONE_NUMBER_ID}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('WhatsApp send error:', err)
  }
}

export function parseWebhook(body) {
  const entries = body?.entry ?? []
  const messages = []

  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') continue
      const value = change.value
      for (const msg of value.messages ?? []) {
        if (msg.type === 'text') {
          messages.push({
            phone: msg.from,
            text: msg.text.body,
          })
        }
      }
    }
  }

  return messages
}
