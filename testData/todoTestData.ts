import { faker } from '@faker-js/faker'
import dayjs from 'dayjs'

const randomFutureDate = () =>
  dayjs()
    .add(faker.number.int({ min: 1, max: 365 }), 'day')
    .format('YYYY-MM-DD')

export const todoTestData = {
  postTodo: {
    withDescription: {
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      completed: false,
    },
    withoutDescription: { title: faker.lorem.words(3) },
    withDueDate: { title: faker.lorem.words(3), completed: false, due_date: randomFutureDate() },
    invalidDescription: {
      title: faker.lorem.words(3),
      description: 'x'.repeat(5001),
      completed: false,
    },
  },
  getTodoById: {
    create: { title: faker.lorem.words(3) },
  },
  putTodo: {
    create: { title: faker.lorem.words(3), completed: false },
    update: { title: faker.lorem.words(3), completed: true },
    updateWithDueDate: { due_date: randomFutureDate() },
    nonExistentUpdate: { title: faker.lorem.words(3) },
    invalidDescription: { title: faker.lorem.words(3), description: 'x'.repeat(5001) },
  },
  deleteTodo: {
    create: { title: faker.lorem.words(3) },
  },
  common: {
    nonExistentId: 999999,
  },
}
