# Add Regression Test

Create a regression `describe` block for a REST API endpoint following the project conventions.

## Inputs to gather first

Before writing anything, identify:

- HTTP method and endpoint path (e.g. `GET /todos/:id`)
- Which status codes to cover — happy path, `401` (unauthenticated), `404` (not found, if the endpoint takes an id), `422` (invalid id format and/or invalid body), …
- Whether the test needs to create a resource first (→ needs `beforeAll`, or `beforeEach` if each test consumes it)
- Whether the response body should be validated with a schema

## File location

Add a new `describe` block to `tests/<resource>.test.ts` (e.g. `tests/todo.test.ts`). Create a new file only when testing a different resource.

## Test data

Add all input values for this endpoint to `testData/<resource>TestData.ts` under a new top-level key named after the endpoint (e.g. `postTodo`, `putTodo`).

```ts
// in testData/todoTestData.ts
$endpoint: {
  create: { title: 'Pro X test' },
  // additional scenario variants
},
```

## Template

```ts
describe('$RESOURCE API – $METHOD $path', () => {
  let resourceId: number // only if a resource must be created first

  beforeAll(async () => {
    // only if setup is needed
    resourceId = await todoPage.create(todoTestData.$endpoint.create).returns('id')
  })

  it('$description with status $STATUS_CODE', async () => {
    await todoPage.$method(/* ... */).expectStatus(HTTP_STATUS.$STATUS).expectJsonSchema(todoSchema) // omit for error responses
  })

  it('returns 401 when unauthenticated', async () => {
    await todoPage.$method(/* ..., */ false).expectStatus(HTTP_STATUS.UNAUTHORIZED)
  })

  // one it() per status code / scenario
})
```

## Rules to follow

- One `it` block per status code/scenario — never combine two independent assertions into one test.
- Cover the happy path plus `401` for every endpoint. Add `404` for endpoints taking an id, and `422` for invalid id format (`todoUrls.todoById.invalidId`) or invalid body (e.g. description too long).
- Use `HTTP_STATUS.*` constants — never raw numbers.
- Use `todoUrls.*` constants (via the Page Object) — never raw strings.
- Use the Page Object (`todoPage`) — never call `common.ts`/Pactum directly from a test.
- Pass `false` as the trailing `authenticated` argument for `401` cases.
- All input values belong in `testData/` — never inline in the test file.
- Only validate the schema on success responses (2xx). Error responses need only `expectStatus`.
- Use `.returns('id')` to carry an id from a setup call into later requests, instead of storing and re-reading a response object.
- Resources created via `beforeAll`/`beforeEach` must be cleaned up in the matching `afterAll`/`afterEach`.
