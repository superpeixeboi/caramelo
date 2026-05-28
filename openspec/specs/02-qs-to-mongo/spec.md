## Purpose

Provide a utility that transforms URL query string parameters into MongoDB filter objects by reading the model's JSON Schema for type coercion and field validation. This enables index endpoints to support filtering, operators, and type-safe queries without manual parsing in each route handler.

## Requirements

### Requirement: qsToMongo converts query params to Mongo filter
The system SHALL export a `qsToMongo(qs, schema)` function from `src/lib/qsToMongo.js` that returns a MongoDB filter object.

#### Scenario: Returns empty object for no params
- **WHEN** `qsToMongo({}, schema)` is called
- **THEN** it SHALL return `{}`

#### Scenario: String field passes through
- **WHEN** `qsToMongo({ name: "João" }, { properties: { name: { type: "string" } } })` is called
- **THEN** it SHALL return `{ name: "João" }`

#### Scenario: Number field coerces value
- **WHEN** `qsToMongo({ age: "25" }, { properties: { age: { type: "number" } } })` is called
- **THEN** it SHALL return `{ age: 25 }`

#### Scenario: Number field rejects non-numeric
- **WHEN** `qsToMongo({ age: "abc" }, { properties: { age: { type: "number" } } })` is called
- **THEN** it SHALL throw a `ValidationError`

#### Scenario: Boolean field coerces "true"/"false"
- **WHEN** `qsToMongo({ active: "true" }, { properties: { active: { type: "boolean" } } })` is called
- **THEN** it SHALL return `{ active: true }`

#### Scenario: Unknown field is silently skipped
- **WHEN** `qsToMongo({ unknownField: "value" }, { properties: { name: { type: "string" } } })` is called
- **THEN** it SHALL return `{}` without throwing

#### Scenario: Comma-separated value becomes $in
- **WHEN** `qsToMongo({ status: "active,inactive" }, { properties: { status: { type: "string" } } })` is called
- **THEN** it SHALL return `{ status: { $in: ["active", "inactive"] } }`

#### Scenario: __gte operator
- **WHEN** `qsToMongo({ age__gte: "18" }, { properties: { age: { type: "number" } } })` is called
- **THEN** it SHALL return `{ age: { $gte: 18 } }`

#### Scenario: __lte operator
- **WHEN** `qsToMongo({ age__lte: "65" }, { properties: { age: { type: "number" } } })` is called
- **THEN** it SHALL return `{ age: { $lte: 65 } }`

#### Scenario: __gt operator
- **WHEN** `qsToMongo({ age__gt: "18" }, { properties: { age: { type: "number" } } })` is called
- **THEN** it SHALL return `{ age: { $gt: 18 } }`

#### Scenario: __lt operator
- **WHEN** `qsToMongo({ age__lt: "65" }, { properties: { age: { type: "number" } } })` is called
- **THEN** it SHALL return `{ age: { $lt: 65 } }`

#### Scenario: __ne operator
- **WHEN** `qsToMongo({ status__ne: "cancelled" }, { properties: { status: { type: "string" } } })` is called
- **THEN** it SHALL return `{ status: { $ne: "cancelled" } }`

#### Scenario: __ne with comma becomes $nin
- **WHEN** `qsToMongo({ status__ne: "active,inactive" }, { properties: { status: { type: "string" } } })` is called
- **THEN** it SHALL return `{ status: { $nin: ["active", "inactive"] } }`

#### Scenario: __like operator generates case-insensitive regex
- **WHEN** `qsToMongo({ name__like: "Joã" }, { properties: { name: { type: "string" } } })` is called
- **THEN** it SHALL return `{ name: { $regex: "Joã", $options: "i" } }`

#### Scenario: Date format string passes through as-is
- **WHEN** `qsToMongo({ birth: "2026-05-27" }, { properties: { birth: { type: "string", format: "date" } } })` is called
- **THEN** it SHALL return `{ birth: "2026-05-27" }` without Date conversion

#### Scenario: Date __gte passes through
- **WHEN** `qsToMongo({ birth__gte: "2026-01-01" }, { properties: { birth: { type: "string", format: "date" } } })` is called
- **THEN** it SHALL return `{ birth: { $gte: "2026-01-01" } }`

#### Scenario: Keys prefixed with _ are skipped
- **WHEN** `qsToMongo({ _page: "1", _limit: "10" }, { properties: {} })` is called
- **THEN** it SHALL return `{}`

#### Scenario: __like on number field throws
- **WHEN** `qsToMongo({ age__like: "1" }, { properties: { age: { type: "number" } } })` is called
- **THEN** it SHALL throw a `ValidationError`

#### Scenario: __gte on boolean field throws
- **WHEN** `qsToMongo({ active__gte: "true" }, { properties: { active: { type: "boolean" } } })` is called
- **THEN** it SHALL throw a `ValidationError`

### Requirement: Index routes use qsToMongo
The customer, place, and service index routes SHALL apply `qsToMongo` to support filtered queries.

#### Scenario: Customer index accepts filters
- **WHEN** `GET /api/customers?email=joao@email.com` is called
- **THEN** the handler SHALL pass the query through `qsToMongo(ctx.query, Customer.schema)` before calling `Customer.find()`

#### Scenario: Places index merges FK filter with query filters
- **WHEN** `GET /api/customers/:customerId/places?name=Office` is called
- **THEN** `customerId` from params SHALL be merged with the result of `qsToMongo` for filtering
