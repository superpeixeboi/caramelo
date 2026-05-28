## 1. MongoModel Enhancement

- [x] 1.1 Add `createdAt`/`updatedAt` injection to `Model.create()`
- [x] 1.2 Add `updatedAt` refresh to `Model.updateById()`

## 2. Domain Models

- [x] 2.1 Implement `src/models/Customer.js` — extends MongoModel, schema with name/email/phone
- [x] 2.2 Implement `src/models/Place.js` — extends MongoModel, schema with customerId/name/address
- [x] 2.3 Implement `src/models/Service.js` — extends MongoModel, schema with placeId/customerId/name/price/status

## 3. Routes

- [x] 3.1 Implement `src/routes/customers.js` — 3 router.param resolvers (customerId, placeId, serviceId)
- [x] 3.2 Implement 5 customer routes (GET / POST / GET/:id / PATCH/:id / DELETE/:id)
- [x] 3.3 Implement 5 place routes (nested under :customerId)
- [x] 3.4 Implement 5 service routes (nested under :customerId/places/:placeId)

## 4. Integration

- [x] 4.1 Register `customerRouter` in `src/app.js`
- [x] 4.2 Run syntax check on all files
