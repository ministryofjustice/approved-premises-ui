import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { when } from 'jest-when'
import TimelineController from './timelineController'
import PersonService from '../../services/personService'
import { personalTimelineFactory } from '../../testutils/factories'
import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../utils/validation'

import paths from '../../paths/people'
import { crnErrorHandling } from '../../utils/people'

jest.mock('../../utils/validation')
jest.mock('../../utils/people/index')

describe('TimelineController', () => {
  const token = 'SOME_TOKEN'
  const flashSpy = jest.fn()

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})

  let timelineController: TimelineController
  let request: Readonly<DeepMocked<Request>>

  beforeEach(() => {
    timelineController = new TimelineController(personService)
    request = createMock<Request>({
      user: { token },
      flash: flashSpy,
    })

    jest.clearAllMocks()
  })

  describe('find', () => {
    it('renders the view without errors if there is no entry in the errorSummary', async () => {
      const requestHandler = timelineController.find()
      when(fetchErrorsAndUserInput as jest.Mock)
        .calledWith(request)
        .mockReturnValue({
          errors: {},
          errorSummary: [],
          userInput: {},
        })

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'people/timeline/find',
        expect.objectContaining({
          errors: undefined,
        }),
      )
    })

    it('renders the view with errors if there are entries in the errorSummary', async () => {
      const requestHandler = timelineController.find()
      const errorSummary = ['some error']
      when(fetchErrorsAndUserInput as jest.Mock)
        .calledWith(request)
        .mockReturnValue({
          errors: {},
          errorSummary,
          userInput: {
            crn: 'X123456',
          },
        })

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('people/timeline/find', {
        pageHeading: "Find someone's application history",
        errorSummary: ['some error'],
        errors: { crn: 'No offender with an ID of undefined found' },
        crn: 'X123456',
      })
    })
  })

  describe('show', () => {
    it('renders the timeline view', async () => {
      const crn = 'X123456'
      const timeline = personalTimelineFactory.build()

      personService.getTimeline.mockResolvedValue(timeline)

      const requestHandler = timelineController.show()

      await requestHandler({ ...request, query: { crn } }, response, next)

      expect(personService.getTimeline).toHaveBeenCalledWith(token, crn)
      expect(response.render).toHaveBeenCalledWith('people/timeline/show', {
        timeline,
        crn,
        pageHeading: `Timeline for ${crn}`,
      })
    })

    it('trims the input and makes it uppercase', async () => {
      const requestHandler = timelineController.show()

      await requestHandler({ ...request, query: { crn: ' x123456 ' } }, response, next)

      expect(personService.getTimeline).toHaveBeenCalledWith(token, 'X123456')
    })

    describe('when there the person service throws an error', () => {
      it('catches the error and redirects to the find page', async () => {
        const crn = 'X456123'
        const error = new Error('Some error')

        personService.getTimeline.mockRejectedValue(error)

        const requestHandler = timelineController.show()

        await requestHandler({ ...request, query: { crn } }, response, next)

        expect(personService.getTimeline).toHaveBeenCalledWith(token, crn)
        expect(crnErrorHandling).toHaveBeenCalledWith(request, error, crn)
        expect(response.redirect).toHaveBeenCalledWith(paths.timeline.find({}))
      })
    })

    describe('when there there is no CRN present in the query', () => {
      it('adds error message to flash and redirects to show', async () => {
        const requestHandler = timelineController.show()

        await requestHandler({ ...request, query: { crn: ' ' } }, response, next)

        expect(addErrorMessageToFlash).toHaveBeenCalledWith(request, 'You must enter a CRN', 'crn')
        expect(response.redirect).toHaveBeenCalledWith(paths.timeline.find({}))
      })
    })

    describe('when the CRN does not follow the correct format', () => {
      it('adds error message to flash and redirects to show with the correct user input', async () => {
        const requestHandler = timelineController.show()

        await requestHandler({ ...request, query: { crn: 'not a CRN' } }, response, next)

        expect(addErrorMessageToFlash).toHaveBeenCalledWith(
          { ...request, query: { crn: 'not a CRN' }, body: { crn: 'not a CRN' } },
          'Enter a CRN in the correct format',
          'crn',
        )
        expect(response.redirect).toHaveBeenCalledWith(paths.timeline.find({}))
      })
    })
  })
})
