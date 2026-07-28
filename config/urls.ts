export const todoUrls = {
  todos: {
    base: '/todos',
  },
  todoById: {
    valid: (id: number | string) => `/todos/${id}`,
    invalidId: '{id}',
  },
}
