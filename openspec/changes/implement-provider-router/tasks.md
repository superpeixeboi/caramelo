## 1. Model Changes

- [x] 1.1 Update `Service` schema — add `providerId`, change status enum to `['pending', 'accepted']`
- [x] 1.2 Implement `src/models/Provider.js` — extends MongoModel

## 2. Middleware

- [x] 2.1 Implement `src/middleware/providerMiddleware.js` — fetchProvider, 5 CRUD handlers, 3 service handlers

## 3. Routes

- [x] 3.1 Implement `src/routes/providerRouter.js` — router.param + 8 routes

## 4. Integration

- [x] 4.1 Register `providerRouter` in `src/app.js`
- [x] 4.2 Run syntax check on all files
