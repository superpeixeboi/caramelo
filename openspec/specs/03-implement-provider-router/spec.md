## Purpose

Implement the Provider resource — CRUD for providers and read/update access to services assigned to them. The Service model gains support for the provider workflow with `providerId` and updated statuses. Provider assignment is done by the customer via existing routes; providers accept or update service details through their own endpoints.

## Requirements

### Requirement: Service model supports provider workflow
The Service model SHALL include `providerId` (optional string) and a status enum of `['pending', 'accepted']`.

#### Scenario: Service starts as pending without a provider
- **WHEN** `Service.create({ placeId: "x", customerId: "y", name: "Test" })` is called
- **THEN** the created document SHALL have `status: "pending"` and no `providerId`

#### Scenario: Service accepts provider assignment
- **WHEN** `Service.updateById(id, { providerId: "prov123", status: "accepted" })` is called
- **THEN** the document SHALL have `providerId: "prov123"` and `status: "accepted"`

### Requirement: Provider model
The system SHALL provide a `Provider` model extending MongoModel with collection `providers` and JSON Schema validation.

#### Scenario: Provider model is defined
- **WHEN** `Provider` is imported
- **THEN** `Provider.collectionName` SHALL be `'providers'` and `Provider.schema` SHALL require `name` and `email`

#### Scenario: Provider validates email format
- **WHEN** `Provider.create({ name: "Maria", email: "invalido" })` is called
- **THEN** a `ValidationError` SHALL be thrown

#### Scenario: Provider coordinates are validated
- **WHEN** `Provider.create({ name: "Maria", email: "m@m.com", coordinates: { lat: "notanumber", lng: 45 } })` is called
- **THEN** a `ValidationError` SHALL be thrown

### Requirement: Provider CRUD routes
The system SHALL expose CRUD for providers under `/api/providers`.

#### Scenario: List providers
- **WHEN** `GET /api/providers` is called
- **THEN** the response SHALL be `200` with an array of providers

#### Scenario: Create provider
- **WHEN** `POST /api/providers` is called with valid JSON body
- **THEN** the response SHALL be `201` with the created provider document

#### Scenario: Show provider
- **WHEN** `GET /api/providers/:providerId` is called with a valid id
- **THEN** the response SHALL be `200` with the provider loaded via `router.param` into `ctx.state.provider`

#### Scenario: Update provider
- **WHEN** `PATCH /api/providers/:providerId` is called with valid data
- **THEN** the response SHALL be `200` with the updated provider

#### Scenario: Delete provider
- **WHEN** `DELETE /api/providers/:providerId` is called with a valid id
- **THEN** the response SHALL be `204`

### Requirement: Provider service index
The system SHALL list services assigned to a provider under `/api/providers/:providerId/services`.

#### Scenario: List assigned services
- **WHEN** `GET /api/providers/:providerId/services` is called
- **THEN** `router.param` SHALL resolve the provider and the response SHALL be `200` with an array of services filtered by `providerId`, with support for `qsToMongo` query filters

### Requirement: Provider service show
The system SHALL show a specific service assigned to a provider.

#### Scenario: Show assigned service
- **WHEN** `GET /api/providers/:providerId/services/:serviceId` is called
- **THEN** both `providerId` and `serviceId` param resolvers SHALL fire and the response SHALL be `200` with `ctx.state.service`

#### Scenario: Service not found for this provider
- **WHEN** `GET /api/providers/:providerId/services/:serviceId` is called with a service that does not have this `providerId`
- **THEN** the response SHALL return the service regardless (providerId filtering via URL param, not ownership enforcement — ownership comes in a future auth spec)

### Requirement: Provider service update
The system SHALL allow providers to update assigned services.

#### Scenario: Provider updates service status
- **WHEN** `PATCH /api/providers/:providerId/services/:serviceId` is called with `{ status: "accepted" }`
- **THEN** the response SHALL be `200` with the updated service
