# Test Patterns

## Layers

Tests are composed from four shared layers plus the test files themselves:

- **testData/** — all test input values and expected results. Never define data inline in test files.
- **config/** — named constants for URLs and HTTP status codes. Never use raw strings or numbers in tests.
- **page-objects/** — HTTP calls (`TodoPage`), returning Pactum's `Spec` for assertions. All request logic lives here.
- **schemas/** — JSON Schema definitions for response body validation.

## Making requests

`TodoPage` exposes `getAll`, `getById`, `create`, `update`, `delete`. Each returns a Pactum `Spec`, so calls can be immediately chained with Pactum's own assertions. Each method accepts a trailing `authenticated` flag (default `true`) — pass `false` to exercise `401` cases, e.g. `todoPage.getAll(false)`.

## Asserting responses

Pactum's `Spec`, returned by every `TodoPage` method, provides chainable assertion methods used in this project:

- `expectStatus(code)` — asserts the HTTP status code
- `expectJsonSchema(schema)` — validates response body shape and types against a JSON Schema (via `ajv`, built into Pactum)
- `expectJsonLike(partial)` — asserts a partial match of fields in the response body
- `.returns(path)` — resolves the awaited chain to a single field (e.g. `.returns('id')`) instead of the full response, used to carry an id into later requests

## Test data

All test input data lives in `testData/`, one file per resource:

- `todoTestData.ts` — organized by endpoint (`postTodo`, `getTodoById`, `putTodo`, `deleteTodo`), with scenario keys within (`withDescription`, `create`, `update`, `nonExistentUpdate`). Shared values live under `common`.

Test files import the named export and never define data inline:

```ts
import { todoTestData } from '../testData/todoTestData.js'
```

Full-lifecycle tests reuse an existing regression scenario instead of duplicating data:

```ts
await todoPage.create(todoTestData.postTodo.withDescription)
```

## Data-driven tests

When the same endpoint is verified across many input combinations, use `forEach` over a `cases` array from `testData/`. Each entry produces one `it` block.

```ts
todoTestData.postTodo.invalidCases.forEach(({ input, description }) => {
  it(`rejects ${description}`, async () => {
    await todoPage.create(input).expectStatus(HTTP_STATUS.UNPROCESSABLE_ENTITY)
  })
})
```

The `it` name is generated from the actual case description — this makes every failing test immediately identifiable in the output without inspecting the data file.

## Endpoint tests

One `describe` per HTTP method/path. Each `it` block covers exactly one scenario (happy path, validation error, not found, …). Resources created in `beforeAll` are read-only for the rest of the `describe` — deletion scenarios instead create a fresh resource per test.

## Full-lifecycle tests

One `describe` per resource, covering the whole CRUD flow (create → read → update → read → delete → read) in sequence. Steps intentionally depend on each other via a shared `let` variable (typically an `id`) declared in the `describe` scope.

---

For step-by-step guidance when writing new tests, use:

- `/add-regression-test`
- `/add-lifecycle-test`
