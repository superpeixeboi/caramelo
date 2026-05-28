## Purpose

Bootstrap `apps/api` — a vanilla JS Koa REST API serving as the backend for the Caramelo platform. This spec covers the foundation: server setup, MongoDB connection via raw driver, MongoModel base class with AJV validation, middleware stack, error handling, development tooling, and monorepo integration. No resource routes — those belong in Spec 01.

## Requirements

### Requirement: Koa server starts and listens on configured port
The system SHALL start a Koa HTTP server on the port specified by the `PORT` environment variable (default 4000).

#### Scenario: Server starts on default port
- **WHEN** the server starts without a PORT environment variable
- **THEN** it SHALL listen on port 4000

#### Scenario: Server starts on custom port
- **WHEN** the environment variable PORT is set to "5000"
- **THEN** the server SHALL listen on port 5000

### Requirement: Health check endpoint
The system SHALL expose a `GET /health` endpoint returning server status.

#### Scenario: Health check returns ok
- **WHEN** a client sends GET /health
- **THEN** the response SHALL have status 200 and body `{ status: "ok", uptime: <seconds>, requestId: "<shortId>" }`

### Requirement: Request ID middleware
Every request SHALL receive a short unique identifier attached to `ctx.state.requestId` and set as the `X-Request-Id` response header.

#### Scenario: Request receives an ID
- **WHEN** any request reaches the server
- **THEN** `ctx.state.requestId` SHALL be an 8-character nanoid string

#### Scenario: Response includes request ID header
- **WHEN** any response is sent
- **THEN** the `X-Request-Id` header SHALL match the request's requestId

### Requirement: Request logger middleware
Every request and response SHALL be logged to console with method, path, status, duration, and requestId.

#### Scenario: Incoming request is logged
- **WHEN** a request arrives
- **THEN** the system SHALL log `→ {method} {path} [{requestId}]`

#### Scenario: Outgoing response is logged
- **WHEN** a response is sent
- **THEN** the system SHALL log `← {status} {duration}ms [{requestId}]`

### Requirement: CORS middleware
The system SHALL allow cross-origin requests from browser apps via `@koa/cors`.

#### Scenario: CORS headers are set
- **WHEN** a browser sends a cross-origin request
- **THEN** the response SHALL include appropriate `Access-Control-Allow-*` headers

### Requirement: Body parser middleware
The system SHALL parse JSON request bodies via `@koa/bodyparser`.

#### Scenario: JSON body is parsed
- **WHEN** a request with `Content-Type: application/json` and body `{"name":"test"}` is received
- **THEN** `ctx.request.body` SHALL equal `{ name: "test" }`

### Requirement: Error handler middleware
The system SHALL catch all errors downstream and return a structured JSON response with the appropriate HTTP status code.

#### Scenario: ValidationError returns 422
- **WHEN** a ValidationError with details is thrown downstream
- **THEN** the response SHALL have status 422 and body `{ error: "<message>", details: [...] }`

#### Scenario: NotFoundError returns 404
- **WHEN** a NotFoundError is thrown downstream
- **THEN** the response SHALL have status 404 and body `{ error: "<message>" }`

#### Scenario: Unknown error returns 500
- **WHEN** a generic Error is thrown downstream
- **THEN** the response SHALL have status 500 and body `{ error: "Internal server error" }`

### Requirement: Custom error classes
The system SHALL provide `ValidationError` (status 422) and `NotFoundError` (status 404) extending Error, exported from `src/lib/errors/`.

#### Scenario: ValidationError has correct shape
- **WHEN** `new ValidationError(details)` is instantiated
- **THEN** `error.status` SHALL be 422 and `error.details` SHALL be the details array

#### Scenario: NotFoundError has correct shape
- **WHEN** `new NotFoundError(resource, id)` is instantiated
- **THEN** `error.status` SHALL be 404 and `error.message` SHALL include the resource and id

### Requirement: MongoDB connection via singleton
The system SHALL connect to MongoDB using the raw `mongodb` driver via a singleton in `src/db/mongo.js`, exported as `connect(uri)` and `getDb()`.

#### Scenario: Successful connection
- **WHEN** `connect(uri)` is called with a valid MongoDB URI
- **THEN** it SHALL return a connected MongoClient and `getDb()` SHALL return the database instance

#### Scenario: Connection failure crashes
- **WHEN** `connect(uri)` is called with an invalid URI
- **THEN** it SHALL throw and the process SHALL exit

### Requirement: MongoModel base class with static CRUD
The system SHALL provide a `MongoModel` base class in `src/models/Model.js` with static CRUD methods that validate against a subclass-defined JSON Schema using AJV.

#### Scenario: Create validates and inserts
- **WHEN** `Customer.create({ name: "João", email: "joao@email.com" })` is called
- **THEN** the data SHALL be validated against Customer's schema, inserted into the `customers` collection, and the created document with `_id` SHALL be returned

#### Scenario: Create rejects invalid data
- **WHEN** `Customer.create({ name: "João" })` is called without required field "email"
- **THEN** a ValidationError SHALL be thrown with details about the missing field

#### Scenario: Find returns matching documents
- **WHEN** `Customer.find({ name: "João" })` is called
- **THEN** an array of matching documents SHALL be returned

#### Scenario: FindById returns a single document
- **WHEN** `Customer.findById(id)` is called with a valid id
- **THEN** the document with that `_id` SHALL be returned

#### Scenario: FindById throws NotFoundError for missing id
- **WHEN** `Customer.findById(id)` is called with a non-existent id
- **THEN** a NotFoundError SHALL be thrown

#### Scenario: UpdateById validates and updates
- **WHEN** `Customer.updateById(id, { email: "novo@email.com" })` is called
- **THEN** the data SHALL be validated and the document SHALL be updated

#### Scenario: DeleteById removes document
- **WHEN** `Customer.deleteById(id)` is called with a valid id
- **THEN** the document SHALL be removed from the collection

### Requirement: Docker Compose for local MongoDB
The system SHALL provide a `docker-compose.yml` at `apps/api/` for running MongoDB locally.

#### Scenario: Docker Compose starts MongoDB
- **WHEN** `docker compose up -d` is run in `apps/api/`
- **THEN** a MongoDB 7 container SHALL start on port 27017 with user `caramelo` and password `caramelo`

### Requirement: Turbo monorepo integration
The `apps/api` package SHALL be integrated into the monorepo so that `turbo run dev` starts it alongside other apps.

#### Scenario: Dev script uses node --watch
- **WHEN** `npm run dev` is run in `apps/api/`
- **THEN** the server SHALL start with Node's built-in `--watch` flag for auto-restart on file changes

#### Scenario: Turbo picks up the workspace
- **WHEN** `turbo run dev` is run from the root
- **THEN** the api workspace SHALL start its dev server (no changes to root turbo.json required)

### Requirement: Environment variables
The system SHALL read configuration from environment variables with sensible defaults.

#### Scenario: MONGODB_URI is configurable
- **WHEN** the environment variable MONGODB_URI is set
- **THEN** the system SHALL connect to that URI instead of the default

#### Scenario: Default MONGODB_URI is local
- **WHEN** MONGODB_URI is not set
- **THEN** the system SHALL default to `mongodb://caramelo:caramelo@localhost:27017`

### Requirement: Prettier pre-commit hook
Staged `.js` files in `apps/api/` SHALL be formatted with Prettier before commit.

#### Scenario: Pre-commit formats JS files
- **WHEN** a commit is made with staged `.js` files in `apps/api/`
- **THEN** those files SHALL be formatted by Prettier before the commit completes
