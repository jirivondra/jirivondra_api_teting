export const todoSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', minimum: 1 },
    title: { type: 'string' },
    description: { type: ['string', 'null'] },
    completed: { type: 'boolean' },
    due_date: { type: ['string', 'null'] },
  },
  required: ['id', 'title', 'completed'],
}

export const todoListSchema = {
  type: 'array',
  items: todoSchema,
}
