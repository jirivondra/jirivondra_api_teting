import { get, post, put, del } from '../common.js'
import { todoUrls } from '../config/urls.js'

interface TodoInput {
  title: string
  description?: string
  completed?: boolean
  due_date?: string
}

export class TodoPage {
  getAll(authenticated = true) {
    return get(todoUrls.todos.base, authenticated)
  }

  getById(id: number | string, authenticated = true) {
    return get(todoUrls.todoById.valid(id), authenticated)
  }

  create(data: TodoInput, authenticated = true) {
    return post(todoUrls.todos.base, data, authenticated)
  }

  update(id: number, data: Partial<TodoInput>, authenticated = true) {
    return put(todoUrls.todoById.valid(id), data, authenticated)
  }

  delete(id: number | string, authenticated = true) {
    return del(todoUrls.todoById.valid(id), authenticated)
  }
}
