import { getCustomerPlaces, createService } from '../api.js'
import { sendMessage } from '../whatsapp.js'

function textStep(id, label) {
  return {
    id,
    type: 'text',
    getPrompt: () => label,
    validate: (text) => text && text.trim().length > 0,
    parse: (text) => ({ [id]: text.trim() }),
  }
}

async function fetchPlaces(ctx) {
  if (ctx.places) return ctx.places
  const customer = ctx.customer
  if (!customer) return []
  const places = await getCustomerPlaces(customer._id)
  ctx.places = places
  return places
}

export const SERVICE_REQUEST = {
  steps: [
    {
      id: 'menu',
      type: 'menu',
      requiresCustomer: true,
      getPrompt: () => {
        return 'Olá! Bem-vindo ao Caramelo. Como posso ajudar?\n\n1. Solicitar um serviço\n2. Sair'
      },
      validate: (text) => text === '1',
      parse: () => ({}),
      getErrorPrompt: () => 'Por favor, digite 1 para solicitar um serviço.',
    },
    textStep('description', 'Descreva o serviço que você precisa:'),
    {
      id: 'place',
      type: 'option',
      requiresCustomer: true,
      getPrompt: async (ctx) => {
        const places = await fetchPlaces(ctx)
        if (places.length === 0) return 'Nenhum local cadastrado. Acesse caramelo.com/places para cadastrar.'
        const lines = places.map((p, i) => `${i + 1}. ${p.name} - ${p.address}`)
        return 'Selecione o local para o serviço:\n\n' + lines.join('\n')
      },
      validate: async (text, ctx) => {
        const places = await fetchPlaces(ctx)
        if (places.length === 0) return false
        const idx = parseInt(text, 10) - 1
        return idx >= 0 && idx < places.length
      },
      parse: async (text, ctx) => {
        const places = await fetchPlaces(ctx)
        const idx = parseInt(text, 10) - 1
        const selected = places[idx]
        return { placeId: selected._id, place: selected }
      },
      getErrorPrompt: () => 'Opção inválida. Tente novamente.',
    },
    {
      id: 'confirm',
      type: 'confirm',
      requiresCustomer: true,
      getPrompt: async (ctx) => {
        const place = ctx.place
        return `Confirme os dados:\n\nServiço: ${ctx.description}\nLocal: ${place.name} - ${place.address}\n\n1. Confirmar\n2. Cancelar`
      },
      validate: (text) => text === '1' || text === '2',
      parse: (text) => ({ confirmed: text === '1' }),
      getErrorPrompt: () => 'Por favor, responda 1 para Confirmar ou 2 para Cancelar.',
    },
  ],

  onComplete: async (ctx, phone) => {
    if (!ctx.confirmed) {
      await sendMessage(phone, 'Solicitação cancelada. Se precisar, estou aqui!')
      return
    }

    const customer = ctx.customer
    const service = await createService({
      placeId: ctx.placeId,
      customerId: customer._id,
      name: ctx.description.substring(0, 60),
      description: ctx.description,
    })

    if (service) {
      await sendMessage(phone, `Serviço solicitado com sucesso! Seu número de protocolo é ${service._id}.`)
    } else {
      await sendMessage(phone, 'Ocorreu um erro ao criar o serviço. Tente novamente mais tarde.')
    }
  },
}
