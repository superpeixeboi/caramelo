import Router from '@koa/router'
import { Provider } from '../models/Provider.js'
import {
  createProvider,
  deleteProvider,
  fetchProvider,
  fetchService,
  findProvider,
  findProviderService,
  getProvider,
  getProviderService,
  patchProvider,
  patchProviderService,
} from '../middleware/providerMiddleware.js'

const router = new Router({ prefix: '/api' })

router.param('providerId', fetchProvider)
router.param('serviceId', fetchService)

// Providers
router.get('/providers', findProvider)
router.post('/providers', createProvider)
router.get('/providers/:providerId', getProvider)
router.patch('/providers/:providerId', patchProvider)
router.delete('/providers/:providerId', deleteProvider)

// Provider services
router.get('/providers/:providerId/services', findProviderService)
router.get('/providers/:providerId/services/:serviceId', getProviderService)
router.patch('/providers/:providerId/services/:serviceId', patchProviderService)

export const providerRouter = router
