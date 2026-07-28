# TODO API – Integration Tests

Integration tests for the REST API of the [TODO_app](https://github.com/jirivondra/TODO_app) project. The test suite is built on Jest and Pactum.

> **Note:** This project contains only tests. The API itself lives in the [TODO_app](https://github.com/jirivondra/TODO_app) repository — it must be running before you execute the tests.

## Stack

| Layer             | Technology                          |
| ----------------- | ------------------------------------ |
| Test runner       | Jest                                 |
| HTTP requests     | Pactum                               |
| Schema validation | JSON Schema (via Pactum's built-in ajv) |
| Test data         | @faker-js/faker, dayjs               |
| Report            | allure-jest                          |
| Language          | TypeScript                           |

## Project structure

```
├── config/
│   ├── httpStatus.ts     # Named HTTP status code constants
│   └── urls.ts           # Named URL path constants
├── docs/
│   ├── principles.md     # DRY, YAGNI, AAA, fluent assertions, no hardcoded values, ...
│   ├── structure.md      # Directory-by-directory overview
│   └── test-patterns.md  # Layers, request/assertion patterns, data-driven tests
├── testData/
│   └── todoTestData.ts   # Centralized test input data, organized by endpoint (faker/dayjs)
├── tests/
│   └── todo.test.ts      # Integration tests
├── page-objects/
│   └── TodoPage.ts       # Page Object – HTTP methods, returning Pactum's Spec
├── schemas/
│   └── schemas.ts        # JSON Schema definitions for response validation
└── common.ts             # get/post/put/del – shared HTTP calls via Pactum
```

See [`CLAUDE.md`](CLAUDE.md) and [`docs/`](docs/) for the full testing conventions, and `.claude/commands/` for guided templates when adding new tests (`/add-regression-test`, `/add-lifecycle-test`).

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```
API_URL=http://localhost:8000
API_USERNAME=your-username
API_PASSWORD=your-password
```

The `.env` file is gitignored and never committed. The test suite reads credentials and the API URL from this file at runtime.

### 3. Install Task

This project uses [Task](https://taskfile.dev) as a task runner. Install it via:

```bash
# macOS
brew install go-task

# Windows
winget install Task.Task

# Linux
sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin
```

## Running the tests

Start the TODO_app API first, then run:

```bash
task run-test          # run all tests
task test-watch        # run in watch mode
task test-result       # run with verbose output
task test-coverage     # run tests with a code coverage report
task report            # run tests and open an Allure HTML report
```

### Custom API URL

```bash
API_URL=http://localhost:9000 task run-test
```

## Taskfile commands

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `task run-test`      | Run all tests                            |
| `task test-watch`    | Run tests in watch mode                  |
| `task test-result`   | Run tests with verbose output            |
| `task test-coverage` | Run tests with a code coverage report    |
| `task report`        | Run tests and open an Allure HTML report |
| `task lint`          | Check code with ESLint                   |
| `task lint-fix`      | Auto-fix lint issues                     |
| `task format-check`  | Check code formatting with Prettier      |
| `task check`         | Run all checks (ESLint + Prettier)       |
| `task fix`           | Auto-fix formatting and lint issues      |

## Authentication

The API uses HTTP Basic Auth. Every request must include an `Authorization` header:

```
Authorization: Basic <base64(username:password)>
```

Credentials are configured via `.env`. The test suite sends them automatically with every request.

## API endpoints

All endpoints require authentication. Every endpoint is covered for its happy path, `401` (missing/invalid auth), and any applicable `404`/`422` validation cases.

| Method | Endpoint     | Description       |
| ------ | ------------ | ----------------- |
| GET    | `/todos`     | List all todos    |
| POST   | `/todos`     | Create a new todo |
| GET    | `/todos/:id` | Get a todo by ID  |
| PUT    | `/todos/:id` | Update a todo     |
| DELETE | `/todos/:id` | Delete a todo     |

## Test architecture

### Page Object Pattern

`TodoPage` encapsulates all HTTP calls. Each method returns Pactum's own `Spec`, enabling fluent chaining of Pactum's native assertions:

```ts
await todoPage
  .create(todoTestData.postTodo.withDescription)
  .expectStatus(HTTP_STATUS.CREATED)
  .expectJsonLike({ title: todoTestData.postTodo.withDescription.title })
```

Every method accepts an optional trailing `authenticated` flag (default `true`) to exercise `401` scenarios, e.g. `todoPage.getAll(false)`. To carry a value (e.g. a created todo's `id`) into a later request, chain `.returns('id')` at the end instead of reading it off a stored response.

### Test data

All test input values live in [`testData/todoTestData.ts`](testData/todoTestData.ts), organized by endpoint — no magic strings inside the tests themselves. Titles and descriptions are generated with `faker` so values stay unique across runs; `due_date` values are generated with `dayjs`. HTTP status codes and URL paths are likewise named constants in [`config/`](config/).

### Test isolation

Endpoints that only read or update a resource (`GET`, `PUT`) share one resource created in `beforeAll` and cleaned up in `afterAll`. `DELETE` scenarios use `beforeEach`/`afterEach` so every test gets its own fresh resource, since each test may consume it.

### Reporting

Run `task report` (or `npm run test-report && npm run allure-generate && npm run allure-open`) to generate and open an [Allure](https://allurereport.org) HTML report. `test-report` also collects coverage and writes the totals to `allure-results/environment.properties` (via [`scripts/write-coverage-environment.mjs`](scripts/write-coverage-environment.mjs)), so the Allure report's **Environment** tab shows Statements/Branches/Functions/Lines coverage alongside the test results.

### Coverage

Run `task test-coverage` (or `npm run test-coverage`) for a standalone code coverage report. Coverage is collected from the test infrastructure — `common.ts`, `config/`, `page-objects/`, `schemas/`, `testData/` — since this repo only contains tests; the API's own source code lives in [TODO_app](https://github.com/jirivondra/TODO_app) and isn't instrumentable from here. A `text` summary prints to the terminal; `html`/`lcov`/`json-summary` reports are written to `coverage/`. Coverage is measured with Jest's built-in [Istanbul](https://istanbul.js.org/) integration — no external service.

### Schemas

JSON Schema definitions in `schemas.ts` define the expected structure and types of API responses, validated via Pactum's `.expectJsonSchema()` (backed by `ajv` internally — no separate validation library needed).
