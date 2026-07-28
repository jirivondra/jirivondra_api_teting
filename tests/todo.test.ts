import { TodoPage } from '../page-objects/TodoPage.js'
import { todoSchema, todoListSchema } from '../schemas/schemas.js'
import { HTTP_STATUS } from '../config/httpStatus.js'
import { todoUrls } from '../config/urls.js'
import { todoTestData } from '../testData/todoTestData.js'

const todoPage = new TodoPage()

describe('TODO API – GET /todos', () => {
  it('returns list of todos with status 200', async () => {
    await todoPage.getAll().expectStatus(HTTP_STATUS.OK).expectJsonSchema(todoListSchema)
  })

  it('returns 401 when unauthenticated', async () => {
    await todoPage.getAll(false).expectStatus(HTTP_STATUS.UNAUTHORIZED)
  })
})

describe('TODO API – POST /todos', () => {
  let todoId: number
  let todoIdWithoutDescription: number
  let todoIdWithDueDate: number

  afterAll(async () => {
    await todoPage.delete(todoId)
    await todoPage.delete(todoIdWithoutDescription)
    await todoPage.delete(todoIdWithDueDate)
  })

  it('creates a new TODO with status 201', async () => {
    todoId = await todoPage
      .create(todoTestData.postTodo.withDescription)
      .expectStatus(HTTP_STATUS.CREATED)
      .expectJsonSchema(todoSchema)
      .expectJsonLike({
        title: todoTestData.postTodo.withDescription.title,
        completed: todoTestData.postTodo.withDescription.completed,
      })
      .returns('id')
  })

  it('creates a TODO without description', async () => {
    todoIdWithoutDescription = await todoPage
      .create(todoTestData.postTodo.withoutDescription)
      .expectStatus(HTTP_STATUS.CREATED)
      .expectJsonSchema(todoSchema)
      .expectJsonLike({
        title: todoTestData.postTodo.withoutDescription.title,
        description: null,
      })
      .returns('id')
  })

  it('creates a TODO with due_date', async () => {
    todoIdWithDueDate = await todoPage
      .create(todoTestData.postTodo.withDueDate)
      .expectStatus(HTTP_STATUS.CREATED)
      .expectJsonSchema(todoSchema)
      .expectJsonLike({ due_date: todoTestData.postTodo.withDueDate.due_date })
      .returns('id')
  })

  it('returns 401 when unauthenticated', async () => {
    await todoPage
      .create(todoTestData.postTodo.withDescription, false)
      .expectStatus(HTTP_STATUS.UNAUTHORIZED)
  })

  it('returns 422 for a description that is too long', async () => {
    await todoPage
      .create(todoTestData.postTodo.invalidDescription)
      .expectStatus(HTTP_STATUS.UNPROCESSABLE_ENTITY)
  })
})

describe('TODO API – GET /todos/:id', () => {
  let createdId: number

  beforeAll(async () => {
    createdId = await todoPage.create(todoTestData.getTodoById.create).returns('id')
  })

  afterAll(async () => {
    await todoPage.delete(createdId)
  })

  it('returns a specific TODO with status 200', async () => {
    await todoPage
      .getById(createdId)
      .expectStatus(HTTP_STATUS.OK)
      .expectJsonSchema(todoSchema)
      .expectJsonLike({ id: createdId })
  })

  it('returns 401 when unauthenticated', async () => {
    await todoPage.getById(createdId, false).expectStatus(HTTP_STATUS.UNAUTHORIZED)
  })

  it('returns 404 for a non-existent TODO', async () => {
    await todoPage.getById(todoTestData.common.nonExistentId).expectStatus(HTTP_STATUS.NOT_FOUND)
  })

  it('returns 422 for an invalid TODO id', async () => {
    await todoPage
      .getById(todoUrls.todoById.invalidId)
      .expectStatus(HTTP_STATUS.UNPROCESSABLE_ENTITY)
  })
})

describe('TODO API – PUT /todos/:id', () => {
  let createdId: number

  beforeAll(async () => {
    createdId = await todoPage.create(todoTestData.putTodo.create).returns('id')
  })

  afterAll(async () => {
    await todoPage.delete(createdId)
  })

  it('updates a TODO and returns status 200', async () => {
    await todoPage
      .update(createdId, todoTestData.putTodo.update)
      .expectStatus(HTTP_STATUS.OK)
      .expectJsonSchema(todoSchema)
      .expectJsonLike({
        completed: todoTestData.putTodo.update.completed,
        title: todoTestData.putTodo.update.title,
      })
  })

  it('updates a TODO with due_date', async () => {
    await todoPage
      .update(createdId, todoTestData.putTodo.updateWithDueDate)
      .expectStatus(HTTP_STATUS.OK)
      .expectJsonSchema(todoSchema)
      .expectJsonLike({ due_date: todoTestData.putTodo.updateWithDueDate.due_date })
  })

  it('returns 401 when unauthenticated', async () => {
    await todoPage
      .update(createdId, todoTestData.putTodo.update, false)
      .expectStatus(HTTP_STATUS.UNAUTHORIZED)
  })

  it('returns 404 when updating a non-existent TODO', async () => {
    await todoPage
      .update(todoTestData.common.nonExistentId, todoTestData.putTodo.nonExistentUpdate)
      .expectStatus(HTTP_STATUS.NOT_FOUND)
  })

  it('returns 422 for a description that is too long', async () => {
    await todoPage
      .update(createdId, todoTestData.putTodo.invalidDescription)
      .expectStatus(HTTP_STATUS.UNPROCESSABLE_ENTITY)
  })
})

describe('TODO API – DELETE /todos/:id', () => {
  let createdId: number

  beforeEach(async () => {
    createdId = await todoPage.create(todoTestData.deleteTodo.create).returns('id')
  })

  afterEach(async () => {
    await todoPage.delete(createdId)
  })

  it('deletes a TODO and returns status 204', async () => {
    await todoPage.delete(createdId).expectStatus(HTTP_STATUS.NO_CONTENT)
  })

  it('returns 401 when unauthenticated', async () => {
    await todoPage.delete(createdId, false).expectStatus(HTTP_STATUS.UNAUTHORIZED)
  })

  it('returns 404 for a non-existent TODO', async () => {
    await todoPage.delete(todoTestData.common.nonExistentId).expectStatus(HTTP_STATUS.NOT_FOUND)
  })

  it('returns 422 for an invalid TODO id', async () => {
    await todoPage
      .delete(todoUrls.todoById.invalidId)
      .expectStatus(HTTP_STATUS.UNPROCESSABLE_ENTITY)
  })
})

describe('TODO API – full lifecycle', () => {
  let todoId: number

  it('POST → creates a new TODO', async () => {
    todoId = await todoPage
      .create(todoTestData.postTodo.withDescription)
      .expectStatus(HTTP_STATUS.CREATED)
      .expectJsonLike({
        title: todoTestData.postTodo.withDescription.title,
        completed: todoTestData.postTodo.withDescription.completed,
      })
      .returns('id')
  })

  it('GET → newly created TODO is available', async () => {
    await todoPage
      .getById(todoId)
      .expectStatus(HTTP_STATUS.OK)
      .expectJsonLike({ id: todoId, title: todoTestData.postTodo.withDescription.title })
  })

  it('PUT → updates the TODO', async () => {
    await todoPage
      .update(todoId, todoTestData.putTodo.update)
      .expectStatus(HTTP_STATUS.OK)
      .expectJsonLike({
        title: todoTestData.putTodo.update.title,
        completed: todoTestData.putTodo.update.completed,
      })
  })

  it('GET → reflects the updated values', async () => {
    await todoPage
      .getById(todoId)
      .expectStatus(HTTP_STATUS.OK)
      .expectJsonLike({
        title: todoTestData.putTodo.update.title,
        completed: todoTestData.putTodo.update.completed,
      })
  })

  it('DELETE → removes the TODO', async () => {
    await todoPage.delete(todoId).expectStatus(HTTP_STATUS.NO_CONTENT)
  })

  it('GET → deleted TODO returns 404', async () => {
    await todoPage.getById(todoId).expectStatus(HTTP_STATUS.NOT_FOUND)
  })
})
