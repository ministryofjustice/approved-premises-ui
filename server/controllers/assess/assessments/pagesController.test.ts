import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import createError from 'http-errors'

import type { DataServices, FormPages } from '@approved-premises/ui'
import PagesController from './pagesController'
import { AssessmentService } from '../../../services'
import TasklistPage from '../../../form-pages/tasklistPage'
import Assess from '../../../form-pages/assess'

import {
  fetchErrorsAndUserInput,
  catchValidationErrorOrPropogate,
  catchAPIErrorOrPropogate,
} from '../../../utils/validation'
import { UnknownPageError } from '../../../utils/errors'
import paths from '../../../paths/assess'
import { viewPath } from '../../../form-pages/utils'

import clarificationNoteFactory from '../../../testutils/factories/clarificationNote'
import assessmentFactory from '../../../testutils/factories/assessment'

const PageConstructor = jest.fn()

jest.mock('../../../utils/validation')
jest.mock('../../../form-pages/utils')
jest.mock('../../../utils/assessmentUtils', () => {
  return {
    getPage: () => PageConstructor,
  }
})

Assess.pages = {} as FormPages

describe('pagesController', () => {
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const assessmentService = createMock<AssessmentService>({})
  const dataServices = createMock<DataServices>({}) as DataServices

  const page = createMock<TasklistPage>({})

  const assessment = assessmentFactory.build()

  const pagesController = new PagesController(assessmentService, dataServices)

  beforeEach(() => {
    assessmentService.initializePage.mockResolvedValue(page)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('show', () => {
    const request: DeepMocked<Request> = createMock<Request>({ url: 'assessments' })
    const errorsAndUserInput = { errors: {}, errorSummary: [] as Array<never>, userInput: {} }

    beforeEach(() => {
      ;(viewPath as jest.Mock).mockReturnValue('assessments/pages/some/view')
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)
      assessmentService.findAssessment.mockResolvedValue(assessment)
    })

    it('renders a page', async () => {
      const requestHandler = pagesController.show('some-task', 'some-page')
      await requestHandler(request, response, next)

      expect(assessmentService.initializePage).toHaveBeenCalledWith(PageConstructor, assessment, request, {}, {})
      expect(response.render).toHaveBeenCalledWith('assessments/pages/some/view', {
        assessmentId: request.params.id,
        task: 'some-task',
        page,
        errors: {},
        errorSummary: errorsAndUserInput.errorSummary,
        ...page.body,
      })
    })

    it('shows errors and user input when returning from an error state', async () => {
      const requestHandler = pagesController.show('some-task', 'some-page')
      await requestHandler(request, response, next)

      expect(assessmentService.initializePage).toHaveBeenCalledWith(
        PageConstructor,
        assessment,
        request,
        dataServices,
        errorsAndUserInput.userInput,
      )

      expect(response.render).toHaveBeenCalledWith('assessments/pages/some/view', {
        assessmentId: request.params.id,
        task: 'some-task',
        page,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...page.body,
      })
    })

    it('returns a 404 when the page cannot be found', async () => {
      assessmentService.initializePage.mockImplementation(() => {
        throw new UnknownPageError('some-page')
      })

      const requestHandler = pagesController.show('some-task', 'some-page')

      await requestHandler(request, response, next)

      expect(next).toHaveBeenCalledWith(createError(404, 'Not found'))
    })

    it('calls catchAPIErrorOrPropogate if the error is not an unknown page error', async () => {
      const genericError = new Error()
      assessmentService.initializePage.mockImplementation(() => {
        throw genericError
      })
      const requestHandler = pagesController.show('some-task', 'some-page')
      await requestHandler(request, response, next)
      expect(catchAPIErrorOrPropogate).toHaveBeenCalledWith(request, response, genericError)
    })
  })

  describe('update actions', () => {
    const request = createMock<Request>({
      url: 'assessments',
      params: { id: 'some-uuid' },
      user: { token: 'some-token' },
    })

    describe('update', () => {
      it('updates an assessment and redirects to the next page', async () => {
        page.next.mockReturnValue('next-page')

        assessmentService.save.mockResolvedValue()

        const requestHandler = pagesController.update('some-task', 'page-name')

        await requestHandler(request, response)

        expect(assessmentService.save).toHaveBeenCalledWith(page, request)

        expect(response.redirect).toHaveBeenCalledWith(
          paths.assessments.pages.show({ id: request.params.id, task: 'some-task', page: 'next-page' }),
        )
      })

      it('redirects to the tasklist if there is no next page', async () => {
        page.next.mockReturnValue(undefined)

        const requestHandler = pagesController.update('some-task', 'page-name')

        await requestHandler(request, response)

        expect(assessmentService.save).toHaveBeenCalledWith(page, request)

        expect(response.redirect).toHaveBeenCalledWith(paths.assessments.show({ id: request.params.id }))
      })

      it('sets a flash and redirects if there are errors', async () => {
        const err = new Error()
        assessmentService.save.mockImplementation(() => {
          throw err
        })

        const requestHandler = pagesController.update('some-task', 'page-name')

        await requestHandler(request, response)

        expect(assessmentService.save).toHaveBeenCalledWith(page, request)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.assessments.pages.show({ id: request.params.id, task: 'some-task', page: 'page-name' }),
        )
      })
    })

    describe('updateSufficientInformation', () => {
      const note = clarificationNoteFactory.build()
      const updateHandler = jest.fn()

      let updateSpy: jest.SpyInstance

      beforeEach(() => {
        assessmentService.createClarificationNote.mockResolvedValue(note)
        updateSpy = jest.spyOn(pagesController, 'update').mockReturnValue(updateHandler)
      })

      it('creates a note and redirects if sufficientInformation is no and there is a query provided', async () => {
        assessmentService.save.mockResolvedValue()

        const requestHandler = pagesController.updateSufficientInformation('some-task', 'page-name')

        await requestHandler({ ...request, body: { sufficientInformation: 'no', query: 'some text' } }, response)

        expect(assessmentService.createClarificationNote).toHaveBeenCalledWith(
          request.user.token,
          request.params.id,
          page.body,
        )

        expect(response.redirect).toHaveBeenCalledWith(
          paths.assessments.clarificationNotes.confirm({ id: request.params.id }),
        )

        expect(updateSpy).not.toHaveBeenCalled()
      })

      it('forwards to the update action if sufficientInformation is yes', async () => {
        const requestHandler = pagesController.updateSufficientInformation('some-task', 'page-name')

        const res = createMock<Response>()

        await requestHandler({ ...request, body: { sufficientInformation: 'yes' } }, res)

        expect(assessmentService.createClarificationNote).not.toHaveBeenCalled()

        expect(updateSpy).toHaveBeenCalledWith('some-task', 'page-name')
        expect(updateHandler).toHaveBeenCalledWith(request, res)
      })

      it('catches an error if sufficientInformation is no but the body is invalid', async () => {
        const requestHandler = pagesController.updateSufficientInformation('some-task', 'page-name')

        request.body = {
          sufficientInformation: 'no',
        }

        const err = new Error()

        assessmentService.save.mockImplementation(() => {
          throw err
        })

        const res = createMock<Response>()

        await requestHandler(request, res)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          res,
          err,
          paths.assessments.pages.show({ id: request.params.id, task: 'some-task', page: 'page-name' }),
        )
      })
    })

    describe('updateInformationRecieved', () => {
      const note = clarificationNoteFactory.build()
      const updateHandler = jest.fn()

      let updateSpy: jest.SpyInstance

      beforeEach(() => {
        assessment.clarificationNotes = [
          clarificationNoteFactory.build({ response: 'some text' }),
          clarificationNoteFactory.build({ response: null }),
        ]
        assessmentService.findAssessment.mockResolvedValue(assessment)

        assessmentService.createClarificationNote.mockResolvedValue(note)
        updateSpy = jest.spyOn(pagesController, 'update').mockReturnValue(updateHandler)
      })

      it('updates the assessment and the correct clarification note if informationReceived is yes', async () => {
        assessmentService.save.mockResolvedValue()

        const requestHandler = pagesController.updateInformationRecieved('some-task', 'page-name')

        await requestHandler(
          { ...request, body: { informationReceived: 'yes', response: 'some text', responseReceivedOn: '2022-01-02' } },
          response,
        )

        expect(assessmentService.save).toHaveBeenCalled()
        expect(assessmentService.updateClarificationNote).toHaveBeenCalledWith(
          request.user.token,
          request.params.id,
          assessment.clarificationNotes[1].id,
          page.body,
        )

        expect(response.redirect).toHaveBeenCalledWith(paths.assessments.show({ id: request.params.id }))
      })

      it('catches an error if informationReceived is yes but the body is invalid', async () => {
        const requestHandler = pagesController.updateInformationRecieved('some-task', 'page-name')

        const err = new Error()

        assessmentService.save.mockImplementation(() => {
          throw err
        })

        const res = createMock<Response>()

        await requestHandler({ ...request, body: { informationReceived: 'yes' } }, res)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          res,
          err,
          paths.assessments.pages.show({ id: request.params.id, task: 'some-task', page: 'page-name' }),
        )
      })

      it('forwards to the update action if informationReceived is no', async () => {
        const requestHandler = pagesController.updateInformationRecieved('some-task', 'page-name')

        const res = createMock<Response>()

        await requestHandler({ ...request, body: { informationReceived: 'no' } }, res)

        expect(assessmentService.createClarificationNote).not.toHaveBeenCalled()

        expect(updateSpy).toHaveBeenCalledWith('some-task', 'page-name')
        expect(updateHandler).toHaveBeenCalledWith(request, res)
      })
    })
  })
})
