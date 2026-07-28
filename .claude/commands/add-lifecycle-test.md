# Add Lifecycle Test

Create a full end-to-end lifecycle `describe` block for a resource, following the project conventions.

## Inputs to gather first

Before writing anything, identify:

- What resource/flow is being tested (e.g. full TODO CRUD)
- Which steps the flow covers (create → read → update → read → delete → read)
- Which piece of shared state is passed between steps (usually an `id`)

## File location

Add a `describe('$RESOURCE API – full lifecycle', ...)` block to `tests/<resource>.test.ts` (e.g. `tests/todo.test.ts`).

## Test data

Reuse existing regression test data instead of duplicating values — see `testData/<resource>TestData.ts`.

```ts
await todoPage.create(todoTestData.postTodo.withDescription)
```

## Template

```ts
describe('$RESOURCE API – full lifecycle', () => {
  let resourceId: number

  it('POST → creates a new $resource', async () => {
    resourceId = await todoPage
      .create(todoTestData.postTodo.withDescription)
      .expectStatus(HTTP_STATUS.CREATED)
      .expectJsonLike({ title: todoTestData.postTodo.withDescription.title })
      .returns('id')
  })

  it('GET → newly created $resource is available', async () => {
    await todoPage
      .getById(resourceId)
      .expectStatus(HTTP_STATUS.OK)
      .expectJsonLike({ id: resourceId })
  })

  it('PUT → updates the $resource', async () => {
    await todoPage
      .update(resourceId, todoTestData.putTodo.update)
      .expectStatus(HTTP_STATUS.OK)
      .expectJsonLike({ title: todoTestData.putTodo.update.title })
  })

  it('GET → reflects the updated values', async () => {
    await todoPage
      .getById(resourceId)
      .expectStatus(HTTP_STATUS.OK)
      .expectJsonLike({ title: todoTestData.putTodo.update.title })
  })

  it('DELETE → removes the $resource', async () => {
    await todoPage.delete(resourceId).expectStatus(HTTP_STATUS.NO_CONTENT)
  })

  it('GET → deleted $resource returns 404', async () => {
    await todoPage.getById(resourceId).expectStatus(HTTP_STATUS.NOT_FOUND)
  })
})
```

## Rules to follow

- Assert only what changed at each step — detailed body/schema validation belongs in regression tests.
- Steps are sequential and intentionally depend on each other — this is the nature of a lifecycle test.
- Shared state (`resourceId`) is declared with `let` in the `describe` scope and set in the first `it`.
- Use `HTTP_STATUS.*` constants — never raw numbers.
- Reuse regression test data instead of duplicating values.
