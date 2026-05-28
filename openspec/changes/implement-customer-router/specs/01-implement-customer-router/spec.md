## Purpose

Implement all customer-domain REST resources: Customer, their Places, and the Services hired for each place. This spec covers 15 routes across a 3-level nested hierarchy, using `router.param()` for parent resolution and extending MongoModel with automatic timestamps.

## Requirements

### Requirement: MongoModel auto-timestamps on create and update
The MongoModel base class SHALL automatically inject `createdAt` and `updatedAt` dates on every `create()` and update `updatedAt` on every `updateById()`.

#### Scenario: Create sets both timestamps
- **WHEN** `Model.create({ name: "Test" })` is called
- **THEN** the created document SHALL include `createdAt` and `updatedAt` as `Date` instances set to the current time

#### Scenario: Update refreshes updatedAt only
- **WHEN** `Model.updateById(id, { name: "Changed" })` is called
- **THEN** the updated document SHALL have `updatedAt` set to a new `Date` while `createdAt` SHALL remain unchanged

### Requirement: Customer model
The system SHALL provide a `Customer` model extending MongoModel with collection `customers` and JSON Schema validation for `name` (required), `email` (required), and `phone` (optional).

#### Scenario: Customer model is defined
- **WHEN** `Customer` is imported
- **THEN** `Customer.collectionName` SHALL be `'customers'` and `Customer.schema` SHALL require `name` and `email`

#### Scenario: Create validates email format
- **WHEN** `Customer.create({ name: "João", email: "invalido" })` is called
- **THEN** a `ValidationError` SHALL be thrown because the email does not match the configured pattern

### Requirement: Place model
The system SHALL provide a `Place` model extending MongoModel with collection `places`, requiring `customerId`, `name`, and optionally `address`, `city`, `state`, `zip`.

#### Scenario: Place model is defined
- **WHEN** `Place` is imported
- **THEN** `Place.collectionName` SHALL be `'places'` and `Place.schema` SHALL require `customerId` and `name`

### Requirement: Service model
The system SHALL provide a `Service` model extending MongoModel with collection `services`, requiring `placeId`, `customerId`, `name`, and optionally `description`, `price`, `status` (enum: active, inactive, cancelled).

#### Scenario: Service model is defined
- **WHEN** `Service` is imported
- **THEN** `Service.collectionName` SHALL be `'services'` and `Service.schema` SHALL require `placeId`, `customerId`, and `name`

#### Scenario: Service status is an enum
- **WHEN** `Service.create({ placeId: "x", customerId: "y", name: "Test", status: "invalid" })` is called
- **THEN** a `ValidationError` SHALL be thrown

### Requirement: Customer routes
The system SHALL expose CRUD for customers under `/api/customers`.

#### Scenario: List customers
- **WHEN** `GET /api/customers` is called
- **THEN** the response SHALL be `200` with an array of customers

#### Scenario: Create customer
- **WHEN** `POST /api/customers` is called with valid JSON body
- **THEN** the response SHALL be `201` with the created customer document

#### Scenario: Show customer
- **WHEN** `GET /api/customers/:customerId` is called with a valid id
- **THEN** the response SHALL be `200` with the customer document loaded via `router.param` into `ctx.state.customer`

#### Scenario: Update customer
- **WHEN** `PATCH /api/customers/:customerId` is called with a valid id and JSON body
- **THEN** the response SHALL be `200` with the updated customer document

#### Scenario: Delete customer
- **WHEN** `DELETE /api/customers/:customerId` is called with a valid id
- **THEN** the response SHALL be `204` with no body

#### Scenario: Customer not found returns 404
- **WHEN** `GET /api/customers/:customerId` is called with a non-existent id
- **THEN** the `router.param` resolver SHALL throw `NotFoundError` and the response SHALL be `404`

### Requirement: Place routes (nested under customer)
The system SHALL expose CRUD for places under `/api/customers/:customerId/places`.

#### Scenario: List places by customer
- **WHEN** `GET /api/customers/:customerId/places` is called
- **THEN** `router.param` SHALL resolve the customer first and the response SHALL be `200` with an array of places filtered by `customerId`

#### Scenario: Create place validates parent customer
- **WHEN** `POST /api/customers/:customerId/places` is called
- **THEN** `router.param` SHALL resolve the customer first and if the customer does not exist a `404` SHALL be returned before the handler runs

#### Scenario: Create place injects customerId
- **WHEN** `POST /api/customers/:customerId/places` is called with a valid body
- **THEN** `customerId` SHALL be injected into the body and the response SHALL be `201` with the created place

#### Scenario: Show place
- **WHEN** `GET /api/customers/:customerId/places/:placeId` is called
- **THEN** both `customerId` and `placeId` param resolvers SHALL fire and the response SHALL be `200` with `ctx.state.place`

#### Scenario: Update place
- **WHEN** `PATCH /api/customers/:customerId/places/:placeId` is called
- **THEN** the response SHALL be `200` with the updated place

#### Scenario: Delete place
- **WHEN** `DELETE /api/customers/:customerId/places/:placeId` is called
- **THEN** the response SHALL be `204`

### Requirement: Service routes (nested under place under customer)
The system SHALL expose CRUD for services under `/api/customers/:customerId/places/:placeId/services`.

#### Scenario: List services by place
- **WHEN** `GET /api/customers/:customerId/places/:placeId/services` is called
- **THEN** `customerId` and `placeId` param resolvers SHALL fire and the response SHALL be `200` with an array of services filtered by `placeId`

#### Scenario: Create service validates parents
- **WHEN** `POST /api/customers/:customerId/places/:placeId/services` is called
- **THEN** both `customerId` and `placeId` param resolvers SHALL fire before the handler; if either parent is missing the response SHALL be `404`

#### Scenario: Create service injects customerId and placeId
- **WHEN** `POST /api/customers/:customerId/places/:placeId/services` is called with valid body
- **THEN** both `customerId` and `placeId` SHALL be injected into the body and the response SHALL be `201`

#### Scenario: Show service
- **WHEN** `GET /api/customers/:customerId/places/:placeId/services/:serviceId` is called
- **THEN** all three param resolvers SHALL fire and the response SHALL be `200` with `ctx.state.service`

#### Scenario: Update service
- **WHEN** `PATCH /api/customers/:customerId/places/:placeId/services/:serviceId` is called
- **THEN** the response SHALL be `200` with the updated service

#### Scenario: Delete service
- **WHEN** `DELETE /api/customers/:customerId/places/:placeId/services/:serviceId` is called
- **THEN** the response SHALL be `204`

### Requirement: All 15 routes registered in a single router
The system SHALL define all customer-domain routes in a single `src/routes/customers.js` file, using `Router({ prefix: '/api' })` and `router.param()` for parent resolution.

#### Scenario: Router is exported and importable
- **WHEN** `app.js` imports `customerRouter` from `src/routes/customers.js`
- **THEN** it SHALL be an `@koa/router` instance with the 15 routes registered

### Requirement: Router is wired into app.js
The `app.js` file SHALL register the customer router alongside the existing health router.

#### Scenario: Customer routes are reachable
- **WHEN** the server is running and `GET /api/customers` is called
- **THEN** the response SHALL reach the customer handler (not a 404)
