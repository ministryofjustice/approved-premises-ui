import TaskClient from './taskClient'
import paths from '../paths/api'

import taskFactory from '../testutils/factories/task'
import describeClient from '../testutils/describeClient'

describeClient('taskClient', provider => {
  let taskClient: TaskClient

  const token = 'token-1'

  beforeEach(() => {
    taskClient = new TaskClient(token)
  })

  describe('all', () => {
    it('makes a get request to the tasks endpoint', async () => {
      const tasks = taskFactory.buildList(2)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: `A request to get a list of tasks`,
        withRequest: {
          method: 'GET',
          path: paths.tasks.index.pattern,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: tasks,
        },
      })

      const result = await taskClient.all()

      expect(result).toEqual(tasks)
    })
  })

  describe('find', () => {
    it('should get a task', async () => {
      const task = taskFactory.build()

      const applicationId = 'some-application-id'
      const taskType = 'placement-request'

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a task',
        withRequest: {
          method: 'GET',
          path: paths.applications.tasks.show({ id: applicationId, taskType }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: task,
        },
      })

      const result = await taskClient.find(applicationId, taskType)

      expect(result).toEqual(task)
    })
  })

  describe('createAllocation', () => {
    it('should allocate a task', async () => {
      const task = taskFactory.build()

      const applicationId = 'some-application-id'
      const userId = 'some-user-id'
      const taskType = 'placement-request'

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to allocate a task',
        withRequest: {
          method: 'POST',
          path: paths.applications.tasks.allocations.create({ id: applicationId, taskType }),
          body: { userId },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 201,
          body: task,
        },
      })

      const result = await taskClient.createAllocation(applicationId, userId, taskType)

      expect(result).toEqual(task)
    })
  })
})
