import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { Request } from 'express'

import { AssessmentClient } from '../data'
import AssessmentService from './assessmentService'
import assessmentFactory from '../testutils/factories/assessment'

import { getBody } from '../form-pages/utils'
import TasklistPage from '../form-pages/tasklistPage'
import { TaskListErrors } from '../@types/ui'
import { ValidationError } from '../utils/errors'

jest.mock('../data/assessmentClient.ts')
jest.mock('../data/personClient.ts')
jest.mock('../form-pages/utils')

describe('AssessmentService', () => {
  const assessmentClient = new AssessmentClient(null) as jest.Mocked<AssessmentClient>

  const assessmentClientFactory = jest.fn()

  const service = new AssessmentService(assessmentClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    assessmentClientFactory.mockReturnValue(assessmentClient)
  })

  it('gets all the assesments for the logged in user and groups them by status', async () => {
    const acceptedAssessments = assessmentFactory.buildList(2, { decision: 'accepted' })
    const rejectedAssessments = assessmentFactory.buildList(3, { decision: 'rejected' })
    const awaitingAssessments = assessmentFactory.buildList(5, { decision: undefined })

    assessmentClient.all.mockResolvedValue([acceptedAssessments, rejectedAssessments, awaitingAssessments].flat())

    const result = await service.getAllForLoggedInUser('token')

    expect(result).toEqual({
      completed: [acceptedAssessments, rejectedAssessments].flat(),
      requestedFurtherInformation: [],
      awaiting: awaitingAssessments,
    })
  })

  it('finds an assessment by its ID', async () => {
    const assessment = assessmentFactory.build()

    assessmentClient.find.mockResolvedValue(assessment)

    const result = await service.findAssessment('token', assessment.id)

    expect(result).toEqual(assessment)

    expect(assessmentClient.find).toHaveBeenCalledWith(assessment.id)
  })

  describe('initializePage', () => {
    let request: DeepMocked<Request>

    const assessment = assessmentFactory.build()
    const Page = jest.fn()

    beforeEach(() => {
      request = createMock<Request>({
        params: { id: assessment.id, task: 'my-task', page: 'first' },
        session: { application: assessment, previousPage: '' },
        user: { token: 'some-token' },
      })
    })

    it('should fetch the assessment from the API', async () => {
      assessmentClient.find.mockResolvedValue(assessment)
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      const result = await service.initializePage(Page, request, {})

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(request.body, assessment, '')
      expect(assessmentClient.find).toHaveBeenCalledWith(request.params.id)
    })
  })

  describe('save', () => {
    const assessment = assessmentFactory.build()

    const token = 'some-token'
    const request = createMock<Request>({
      params: { id: assessment.id, task: 'some-task', page: 'some-page' },
      user: { token },
    })

    describe('when there are no validation errors', () => {
      let page: DeepMocked<TasklistPage>

      beforeEach(() => {
        page = createMock<TasklistPage>({
          errors: () => {
            return {} as TaskListErrors<TasklistPage>
          },
          body: { foo: 'bar' },
        })

        assessmentClient.find.mockResolvedValue(assessment)
      })

      it('does not throw an error', () => {
        expect(async () => {
          await service.save(page, request)
        }).not.toThrow(ValidationError)
      })

      it('saves data to the api', async () => {
        await service.save(page, request)

        expect(assessmentClientFactory).toHaveBeenCalledWith(token)
        expect(assessmentClient.update).toHaveBeenCalledWith(assessment)
      })
    })

    describe('When there validation errors', () => {
      it('throws an error if there is a validation error', async () => {
        const errors = createMock<TaskListErrors<TasklistPage>>({ knowOralHearingDate: 'error' })
        const page = createMock<TasklistPage>({
          errors: () => errors,
        })

        expect.assertions(1)
        try {
          await service.save(page, request)
        } catch (e) {
          expect(e).toEqual(new ValidationError(errors))
        }
      })
    })
  })
})
