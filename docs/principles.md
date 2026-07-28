# Testing Principles

## DRY (Don't Repeat Yourself)

All code must follow the DRY principle — no duplicated logic or code. Repeated parts belong in a Page Object or helper.

## YAGNI (You Aren't Gonna Need It)

Only add code that is currently needed. Add new Page Objects, helpers, or abstractions only when they are actually used.

## AAA (Arrange – Act – Assert)

Each `it` block follows the AAA pattern in a fixed order:

**Arrange** — prepare everything the test needs. Where this lives depends on the scope:

- `testData/` — centralized input values imported into the test file
- `beforeAll` — one-time setup for the whole `describe` (e.g. create a resource that all tests will read)
- `beforeEach` — setup that must repeat before every test (e.g. create a fresh resource when each test will destroy it)

**Act & Assert** — a Page Object method call (`todoPage.create(...)`, `todoPage.getById(...)`, …) with `.expectStatus(...)` and optionally `.expectJsonSchema(...)` / `.expectJsonLike(...)` chained directly onto it, then `await`ed. Pactum attaches assertions to the request before it runs, so Act and Assert are one statement, not two — there is no intermediate response variable to assert against afterwards.

```ts
// Arrange (testData imported from testData/, beforeAll created the resource)
// Act & Assert
await todoPage.getById(todoId).expectStatus(HTTP_STATUS.OK).expectJsonSchema(todoSchema)
```

## beforeAll vs beforeEach

Choose based on whether the test consumes the resource:

- `beforeAll` (+ cleanup if needed) — the resource survives all tests in the `describe` (GET, PUT scenarios: they read or update, never delete)
- `beforeEach` — a fresh resource is needed for every test (DELETE scenarios: each test deletes the resource)

## Fluent assertions

Page Object methods return a Pactum `Spec` — Pactum's own request builder, which exposes `expectStatus`, `expectJsonSchema`, `expectJsonLike`, `.returns(path)`, and more, and is itself awaitable. Always chain — never split assertions into separate statements on the same call.

```ts
await todoPage
  .create(todoTestData.postTodo.withDescription)
  .expectStatus(HTTP_STATUS.CREATED)
  .expectJsonSchema(todoSchema)
```

## Named test data

All test input values live in `testData/`, one file per resource. Test files import from there — never define input values inline.

```ts
import { todoTestData } from '../testData/todoTestData.js'
```

Each file is a single named export organized by endpoint at the top level, with named scenario keys below:

```ts
export const todoTestData = {
  postTodo: {
    withDescription: {
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      completed: false,
    },
    withoutDescription: { title: faker.lorem.words(3) },
  },
  // ...
}
```

Use `faker` for values that must be unique across runs (titles, descriptions) and `dayjs` for generated dates (e.g. `due_date`). Use static values only where results must be deterministic.

**Naming conventions:**

- Top-level key — name of the endpoint (`postTodo`, `putTodo`, `getTodoById`)
- Scenario key — intent of the data (`valid`, `create`, `update`, `nonExistentUpdate`)
- Shared data across endpoints — group under `common` (e.g. `common.nonExistentId`)

**Full-lifecycle tests** reuse existing regression test data (e.g. `postTodo.withDescription`, `putTodo.update`) rather than maintaining a separate copy of the same data.

## Facade / Page Object pattern

Tests never call `common.ts`/Pactum directly. `TodoPage` is a facade that hides URL construction and returns Pactum's own `Spec` chain, so tests assert with Pactum's native methods instead of a custom wrapper. Transport-level changes (auth, base URL) stay confined to `common.ts` and never leak into test files.

```
test file → TodoPage (facade, builds request) → common.ts (Pactum) → API
```

## Cyclomatic complexity

Every function must have a cyclomatic complexity of at most **2**. Complexity starts at 1 and increases by 1 for each branch: `if`, ternary `?:`, `&&`, `||`, `for`, `while`, `switch case`, and each default parameter value.

A complexity above 2 is a signal that the function is doing too much or contains logic that should be split — e.g. one function per HTTP method instead of one function with a method-dispatch table, the way `common.ts` exports `get`/`post`/`put`/`del` separately instead of a single parameterized `makeRequest`.

Enforced automatically by ESLint — the build will fail if the limit is exceeded.

**Allowed (complexity 2):**

```ts
function getClient(authenticated: boolean) {
  return authenticated ? authenticatedClient : unauthenticatedClient // +1
}
```

**Not allowed (complexity 3):**

```ts
function buildUrl(baseUrl: string, path: string) {
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    // +1 (if), +1 (&&) → complexity 3
    throw new Error(`Invalid BASE_URL: ${baseUrl}`)
  }
  return `${baseUrl}${path}`
}
```

## No if conditions in helpers

Instead of `if`/`else` blocks, prefer a functional approach — ternaries, dispatch objects, `filter`/`forEach`, or delegating to a client library's own configuration (e.g. Pactum's `request.setBaseUrl()` instead of manually validating and concatenating URLs). Conditions reduce readability and testability, and are usually what pushes a function over the complexity limit.

## Test isolation

Each `it` block must be fully independent — it must not rely on state left by another test or assume a specific execution order, except in the full-lifecycle `describe`, where sequential dependency between steps is intentional.

## Single concern per test

Each `it` block tests exactly one thing — one status code, one scenario. Do not combine multiple independent assertions into a single test.

## Data-driven tests

When the same endpoint must be verified across multiple input combinations, use a `forEach` loop over a `cases` array from `testData/` instead of repeating `it` blocks manually. Each array entry produces one independent test.

Use data-driven tests when:

- The same endpoint is tested with many input variants (positive, negative, edge cases, …)
- The test body is identical across all variants — only the inputs and expected result differ

Do not use data-driven tests when:

- The scenarios differ structurally (different setup, different assertions) — write separate `it` blocks instead
- There is only one or two variants — `forEach` over a single-element array adds noise without benefit

## No hardcoded static values

No static text or value may appear directly in a test. Every static value must be assigned to a named variable. Allowed locations:

- **`testData/`** — test input values, expected results
- **`config/httpStatus.ts`** — HTTP status codes
- **`config/urls.ts`** — URL paths
- **`schemas/`** — JSON Schema definitions for response validation

This applies to: URLs, HTTP status codes, test input values, and any other literal that would otherwise appear inline.
