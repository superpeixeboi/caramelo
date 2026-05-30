const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000/api'

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`API error ${res.status} ${path}:`, err)
    return null
  }

  if (res.status === 204) return null
  return res.json()
}

export async function getTicket(phone) {
  const res = await apiFetch(`/tickets?phone=${encodeURIComponent(phone)}&status=open`)
  if (res && res.data) {
    return res.data[0] || null
  }
  return null
}

export async function createTicket(data) {
  const res = await apiFetch('/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res?.data || null
}

export async function patchTicket(id, data) {
  const res = await apiFetch(`/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return res?.data || null
}

export async function findCustomerByPhone(phone) {
  const res = await apiFetch(`/customers?phone=${encodeURIComponent(phone)}`)
  if (res && res.data) {
    return res.data[0] || null
  }
  return null
}

export async function getCustomerPlaces(customerId) {
  const res = await apiFetch(`/customers/${customerId}/places`)
  return res?.data || []
}

export async function createService(data) {
  const placeId = data.placeId
  const res = await apiFetch(`/customers/${data.customerId}/places/${placeId}/services`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res?.data || null
}
