import Router from '@koa/router'
import { Customer } from '../models/Customer.js'
import { Place } from '../models/Place.js'
import { Service } from '../models/Service.js'
import { createCustomer, deleteCustomer, fetchCustomer, findCustomer, getCustomer, patchCustomer } from '../middleware/customerMiddleware.js'
import { createPlace, deletePlace, fetchPlace, findPlace, getPlace, patchPlace } from '../middleware/placeMiddleware.js'
import { createService, deleteService, fetchService, findService, getService, patchService } from '../middleware/serviceMiddleware.js'

const router = new Router({ prefix: '/api' })

router.param('customerId', fetchCustomer)
router.param('placeId', fetchPlace)
router.param('serviceId', fetchService)

// Customers
router.get('/customers', findCustomer)
router.post('/customers', createCustomer)
router.get('/customers/:customerId', getCustomer)
router.patch('/customers/:customerId', patchCustomer)
router.delete('/customers/:customerId', deleteCustomer)

// Places
router.get('/customers/:customerId/places', findPlace)
router.post('/customers/:customerId/places', createPlace)
router.get('/customers/:customerId/places/:placeId', getPlace)
router.patch('/customers/:customerId/places/:placeId', patchPlace)
router.delete('/customers/:customerId/places/:placeId', deletePlace)

// Services
router.get('/customers/:customerId/places/:placeId/services', findService)
router.post('/customers/:customerId/places/:placeId/services', createService)
router.get('/customers/:customerId/places/:placeId/services/:serviceId', getService)
router.patch('/customers/:customerId/places/:placeId/services/:serviceId', patchService)
router.delete('/customers/:customerId/places/:placeId/services/:serviceId', deleteService)

export const customerRouter = router
