## Context

Index endpoints (`GET /api/customers`, etc.) currently return all documents unfiltered. Users of the API need to filter by fields like email, name, age ranges, status, etc. The MongoModel already has JSON Schemas with property types — we can leverage those for automatic type coercion instead of manual parsing in each handler.

## Goals / Non-Goals

**Goals:**
- Single `qsToMongo(qs, schema)` function in `src/lib/qsToMongo.js`
- Type coercion: string, number, boolean (from schema.properties type)
- Date pass-through as ISO strings (no Date object conversion)
- Operator suffixes: `__gte`, `__lte`, `__gt`, `__lt`, `__ne`, `__like`
- Comma-separated values → `$in` (or `$nin` with `__ne`)
- Unknown fields silently skipped
- Type mismatch throws `ValidationError`
- Wire into 3 index handlers in `customers.js`

**Non-Goals:**
- No pagination, sorting, or projection (handled separately via headers)
- No nested property queries (e.g., `address.city`)
- No dot-notation or MongoDB aggregation
- No JSON Schema validation against the model beyond type coercion
- No modification to param middleware or POST/PATCH handlers

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Function signature | `qsToMongo(qs, schema)` | `qs` = `ctx.query` (plain object), `schema` = `Model.schema` — both available at call site |
| Date handling | ISO strings, no Date object | Avoids timezone shifts; lexicographic comparison works for ISO strings |
| Unknown fields | Silently skipped | Client may send extra params (`_`, `utm_*`, etc.) without breaking |
| Type errors | Throw `ValidationError` | Consistent with MongoModel validation; caught by errorHandler |
| Operator suffix | `__` double-underscore | Unambiguous, unlikely to clash with actual field names |
| `__like` implementation | `$regex` + `$options: "i"` | Case-insensitive substring match; simple and effective |
| Operators on boolean | Disallowed (`__gte`, `__like`, etc.) | Semantically meaningless; throw clear error |
| `__like` on number | Disallowed | Regex on numbers is undefined behavior |
| Field lookup | Direct `schema.properties[field]` | Simple; matches how models define their schema |
| `_` prefixed keys | Always skipped | Reserved for meta params like `_page`, `_sort` |

## Risks / Trade-offs

- [Risk] Schema properties may not capture all Mongo query use cases (e.g., `$or`, `$exists`). Mitigation: the lib is intentionally scoped to flat field filters; complex queries can still be built manually.
- [Risk] `$regex` without escaping user input could lead to ReDoS or unexpected behavior. Mitigation: `__like` values are short query strings from URL params — risk is low but noted.
- [Trade-off] Strings passed through as-is means `{ name: "João" }` is a literal match, not a regex. Clients expecting partial matching need `__like`.
