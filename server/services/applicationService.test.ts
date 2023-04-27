import type { Request } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { DataServices, TaskListErrors } from '@approved-premises/ui'
import type { SubmitApplication, UpdateApprovedPremisesApplication } from '@approved-premises/api'

import type TasklistPage from '../form-pages/tasklistPage'
import { ValidationError } from '../utils/errors'
import ApplicationService from './applicationService'
import ApplicationClient from '../data/applicationClient'
import { getBody, getPageName, getTaskName } from '../form-pages/utils'

import Apply from '../form-pages/apply'
import {
  activeOffenceFactory,
  applicationFactory,
  applicationSummaryFactory,
  assessmentFactory,
  documentFactory,
} from '../testutils/factories'
import { TasklistPageInterface } from '../form-pages/tasklistPage'
import { getApplicationSubmissionData, getApplicationUpdateData } from '../utils/applications/getApplicationData'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'my-task': {} },
  }
})

Apply.pages['my-task'] = {
  first: FirstPage,
  second: SecondPage,
}

jest.mock('../data/applicationClient.ts')
jest.mock('../data/personClient.ts')
jest.mock('../utils/applications/utils')
jest.mock('../form-pages/utils')
jest.mock('../utils/applications/getApplicationData')

describe('ApplicationService', () => {
  const applicationClient = new ApplicationClient(null) as jest.Mocked<ApplicationClient>
  const applicationClientFactory = jest.fn()

  const service = new ApplicationService(applicationClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    applicationClientFactory.mockReturnValue(applicationClient)
  })

  describe('getAllForLoggedInUser', () => {
    const token = 'SOME_TOKEN'
    const submittedApplications = applicationSummaryFactory.buildList(5, { status: 'submitted' })
    const inProgressApplications = applicationSummaryFactory.buildList(2, { status: 'inProgress' })
    const requestedFurtherInformationApplications = applicationSummaryFactory.buildList(1, {
      status: 'requestedFurtherInformation',
    })

    const applications = [submittedApplications, inProgressApplications, requestedFurtherInformationApplications].flat()

    it('fetches all applications', async () => {
      applicationClient.all.mockResolvedValue(applications)

      const result = await service.getAllForLoggedInUser(token)

      expect(result).toEqual({
        inProgress: inProgressApplications,
        requestedFurtherInformation: requestedFurtherInformationApplications,
        submitted: submittedApplications,
      })

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.all).toHaveBeenCalled()
    })
  })

  describe('createApplication', () => {
    it('calls the create method and returns an application', async () => {
      const application = applicationFactory.build()
      const offence = activeOffenceFactory.build()

      const token = 'SOME_TOKEN'

      applicationClient.create.mockResolvedValue(application)

      const result = await service.createApplication(token, application.person.crn, offence)

      expect(result).toEqual(application)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.create).toHaveBeenCalledWith(application.person.crn, offence)
    })
  })

  describe('findApplication', () => {
    it('calls the find method and returns an application', async () => {
      const application = applicationFactory.build()
      const token = 'SOME_TOKEN'

      applicationClient.find.mockResolvedValue(application)

      const result = await service.findApplication(token, application.id)

      expect(result).toEqual(application)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.find).toHaveBeenCalledWith(application.id)
    })
  })

  describe('getDocuments', () => {
    it('calls the documents method and returns a list of documents', async () => {
      const application = applicationFactory.build()
      const documents = documentFactory.buildList(5)

      const token = 'SOME_TOKEN'

      applicationClient.documents.mockResolvedValue(documents)

      const result = await service.getDocuments(token, application)

      expect(result).toEqual(documents)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.documents).toHaveBeenCalledWith(application)
    })
  })

  describe('getApplicationFromSessionOrAPI', () => {
    let request: DeepMocked<Request>

    const application = applicationFactory.build()

    beforeEach(() => {
      request = createMock<Request>({
        params: { id: application.id },
      })
    })

    it('should fetch the application from the API if it is not in the session', async () => {
      request.session.application = undefined
      applicationClient.find.mockResolvedValue(application)

      const result = await service.getApplicationFromSessionOrAPI(request)

      expect(result).toEqual(application)

      expect(applicationClient.find).toHaveBeenCalledWith(request.params.id)
    })

    it('should fetch the application from the session if it is present', async () => {
      request.session.application = application

      const result = await service.getApplicationFromSessionOrAPI(request)

      expect(result).toEqual(application)

      expect(applicationClient.find).not.toHaveBeenCalled()
    })

    it('should fetch the application from the API if and application is in the session but it is not the same application as the one being requested', async () => {
      request.session.application = applicationFactory.build()
      applicationClient.find.mockResolvedValue(application)

      const result = await service.getApplicationFromSessionOrAPI(request)

      expect(result).toEqual(application)

      expect(applicationClient.find).toHaveBeenCalledWith(request.params.id)
    })
  })

  describe('initializePage', () => {
    let request: DeepMocked<Request>

    const dataServices = createMock<DataServices>({}) as DataServices
    const application = applicationFactory.build()
    const Page = jest.fn()

    beforeEach(() => {
      applicationClient.find.mockResolvedValue(application)

      request = createMock<Request>({
        params: { id: application.id, task: 'my-task', page: 'first' },
        session: { previousPage: '' },
        user: { token: 'some-token' },
      })
    })

    it('should fetch the application from the API if it is not in the session', async () => {
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      const result = await service.initializePage(Page, request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(request.body, application, '')
      expect(applicationClient.find).toHaveBeenCalledWith(request.params.id)
    })

    it('should return the session and a page from a page list', async () => {
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      const result = await service.initializePage(Page, request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(request.body, application, '')
    })

    it('should initialize the page with the session and the userInput if specified', async () => {
      const userInput = { foo: 'bar' }
      ;(getBody as jest.Mock).mockReturnValue(userInput)

      const result = await service.initializePage(Page, request, dataServices, userInput)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith(userInput, application, '')
    })

    it('should load from the application if the body and userInput are blank', async () => {
      const data = { 'my-task': { first: { foo: 'bar' } } }
      const applicationWithData = {
        ...application,
        data,
      }
      request.body = {}
      applicationClient.find.mockResolvedValue(applicationWithData)
      ;(getBody as jest.Mock).mockReturnValue(data['my-task'].first)

      const result = await service.initializePage(Page, request, dataServices)

      expect(result).toBeInstanceOf(Page)

      expect(Page).toHaveBeenCalledWith({ foo: 'bar' }, applicationWithData, '')
    })

    it("should call a service's initialize method if it exists", async () => {
      const OtherPage = { initialize: jest.fn() } as unknown as TasklistPageInterface
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      await service.initializePage(OtherPage, request, dataServices)

      expect(OtherPage.initialize).toHaveBeenCalledWith(request.body, application, request.user.token, dataServices)
    })

    it("retrieve the 'previousPage' value from the session and call the Page object's constructor with that value", async () => {
      ;(getBody as jest.Mock).mockReturnValue(request.body)

      request.session.previousPage = 'previous-page-name'
      await service.initializePage(Page, request, dataServices)

      expect(Page).toHaveBeenCalledWith(request.body, application, 'previous-page-name')
    })
  })

  describe('save', () => {
    const application = applicationFactory.build({ data: null })
    const token = 'some-token'
    const request = createMock<Request>({
      params: { id: application.id, task: 'some-task', page: 'some-page' },
      user: { token },
    })
    const applicationData = createMock<UpdateApprovedPremisesApplication>()

    beforeEach(() => {
      applicationClient.find.mockResolvedValue(application)
      ;(getApplicationUpdateData as jest.Mock).mockReturnValue(applicationData)
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
        ;(getPageName as jest.Mock).mockReturnValue('some-page')
        ;(getTaskName as jest.Mock).mockReturnValue('some-task')
      })

      it('does not throw an error', () => {
        expect(async () => {
          await service.save(page, request)
        }).not.toThrow(ValidationError)
      })

      it('saves data to the api', async () => {
        await service.save(page, request)

        expect(applicationClientFactory).toHaveBeenCalledWith(token)
        expect(applicationClient.update).toHaveBeenCalledWith(application.id, applicationData)
      })

      it('updates an in-progress application', async () => {
        application.data = { 'some-task': { 'other-page': { question: 'answer' } } }

        await service.save(page, request)

        expect(getApplicationUpdateData).toHaveBeenCalledWith({
          ...application,
          data: {
            'some-task': {
              'other-page': { question: 'answer' },
              'some-page': { foo: 'bar' },
            },
          },
        })
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

  describe('submit', () => {
    const token = 'some-token'
    const request = createMock<Request>({
      user: { token },
    })
    const application = applicationFactory.build()
    const applicationData = createMock<SubmitApplication>()

    it('calls the submit client method', async () => {
      ;(getApplicationSubmissionData as jest.Mock).mockReturnValue(applicationData)
      await service.submit(request.user.token, application)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.submit).toHaveBeenCalledWith(application.id, applicationData)

      expect(getApplicationSubmissionData).toHaveBeenCalledWith(application)
    })
  })

  describe('getAssessment', () => {
    const token = 'some-token'
    const id = 'some-uuid'
    const assessment = assessmentFactory.build()

    it('calls the assessment client method', async () => {
      applicationClient.assessment.mockResolvedValue(assessment)

      const result = await service.getAssessment(token, id)

      expect(result).toEqual(assessment)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.assessment).toHaveBeenCalledWith(id)
    })
  })
})
