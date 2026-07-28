# Project Structure

## Directory Overview

```
config/         # constants and static configuration
docs/           # project documentation
page-objects/   # Page Object Pattern – encapsulates HTTP calls per resource
schemas/        # JSON Schema definitions for response body validation
testData/       # centralized test input data, one file per resource
tests/          # test files, one per resource
```

## config/

Static, reusable constants shared across the project.

- `httpStatus.ts` — named HTTP status code constants (`HTTP_STATUS.OK`, `HTTP_STATUS.UNAUTHORIZED`, `HTTP_STATUS.NOT_FOUND`, `HTTP_STATUS.UNPROCESSABLE_ENTITY`, …). Always use these instead of raw numbers.
- `urls.ts` — named URL path constants per resource (`todoUrls.todos.base`, `todoUrls.todoById.valid(id)`, `todoUrls.todoById.invalidId` for malformed-id 422 cases). Always use these instead of inline strings.

## page-objects/

Encapsulates all HTTP calls for a resource. Each method builds the request via `common.ts` and returns Pactum's `Spec` directly, so callers chain Pactum's own fluent assertions on the result. Tests never call `common.ts`/Pactum directly — only through a Page Object.

- `TodoPage.ts` — HTTP methods (`getAll`, `getById`, `create`, `update`, `delete`), each returning a `Spec`. Every method accepts a trailing `authenticated` flag (default `true`) used for `401` scenarios.

## schemas/

Standard JSON Schema definitions used by Pactum's `.expectJsonSchema()` (validated internally via `ajv`) to check response body shape and types.

- `schemas.ts` — `todoSchema` (single Todo) and `todoListSchema` (array of Todos).

## testData/

Centralized test input data. One file per resource.

- `todoTestData.ts` — input data for TODO tests, organized by endpoint (`postTodo`, `getTodoById`, `putTodo`, `deleteTodo`) with a `common` group for values shared across endpoints (e.g. `nonExistentId`). Titles/descriptions use `faker` for uniqueness across runs; `due_date` values use `dayjs`.

Test files import the named export and reference data by key — never define input values inline in test files.

## tests/

Test files, one per resource. Each file groups tests by endpoint (`describe` per HTTP method/path) plus a full-lifecycle `describe` that exercises the whole CRUD flow end to end.

- `todo.test.ts` — all TODO endpoint tests, plus the full-lifecycle flow.

## Root files

- `common.ts` — exports `get`, `post`, `put`, `del`, each accepting a trailing `authenticated` flag (default `true`) and returning a Pactum `Spec`. Shared HTTP calls via Pactum, with the base URL (`API_URL`) configured once via `request.setBaseUrl()` and Basic Auth headers (from `.env`) attached per request when `authenticated` is `true`.

## .env

Runtime secrets and environment-specific config. Never committed to git.

```
API_URL=http://localhost:8000
API_USERNAME=your-username
API_PASSWORD=your-password
```
