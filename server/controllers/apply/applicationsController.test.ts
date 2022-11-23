import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'
import ApplicationsController from './applicationsController'
import { ApplicationService, PersonService } from '../../services'
import { fetchErrorsAndUserInput } from '../../utils/validation'
import personFactory from '../../testutils/factories/person'
import applicationFactory from '../../testutils/factories/application'
import risksFactory from '../../testutils/factories/risks'
import { sections } from '../../form-pages/apply'

import paths from '../../paths/apply'
import { DateFormats } from '../../utils/dateUtils'
import { mapApiPersonRisksForUi } from '../../utils/utils'

jest.mock('../../utils/validation')

describe('applicationsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const applicationService = createMock<ApplicationService>({})
  const personService = createMock<PersonService>({})

  let applicationsController: ApplicationsController

  beforeEach(() => {
    applicationsController = new ApplicationsController(applicationService, personService)
    request = createMock<Request>({ user: { token } })
    response = createMock<Response>({})
  })

  describe('list', () => {
    it('renders the list view', async () => {
      applicationService.tableRows.mockResolvedValue([])
      const requestHandler = applicationsController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/list', {
        pageHeading: 'Approved Premises applications',
        applicationSummaries: [],
      })
      expect(applicationService.tableRows).toHaveBeenCalled()
    })
  })

  describe('start', () => {
    it('renders the start page', () => {
      const requestHandler = applicationsController.start()

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/start', {
        pageHeading: 'Apply for an Approved Premises (AP) placement',
      })
    })
  })

  describe('show', () => {
    const application = createMock<Application>({ person: { crn: 'some-crn' } })
    const risks = mapApiPersonRisksForUi(risksFactory.build())

    beforeEach(() => {
      request = createMock<Request>({
        params: { id: application.id },
        user: {
          token,
        },
      })

      personService.getPersonRisks.mockResolvedValue(risks)
    })

    it('fetches the application from session and renders the task list if an application exists and is in the session', async () => {
      const requestHandler = applicationsController.show()

      request.session.application = application

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/show', { application, risks, sections })

      expect(personService.getPersonRisks).toHaveBeenCalledWith(token, 'some-crn')
      expect(applicationService.findApplication).not.toHaveBeenCalledWith(token, application.id)
    })

    it('fetches the application from the API and renders the task list if an application exists and is not in the session', async () => {
      const requestHandler = applicationsController.show()

      request.session.application = undefined
      applicationService.findApplication.mockResolvedValue(application)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/show', { application, risks, sections })

      expect(personService.getPersonRisks).toHaveBeenCalledWith(token, 'some-crn')
      expect(applicationService.findApplication).toHaveBeenCalledWith(token, application.id)
    })
  })

  describe('new', () => {
    describe('If there is a CRN in the flash', () => {
      const person = personFactory.build()

      beforeEach(() => {
        request = createMock<Request>({
          user: { token },
          flash: jest.fn().mockReturnValue([person.crn]),
        })
        personService.findByCrn.mockResolvedValue(person)
      })

      it('it should render the start of the application form', async () => {
        ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
          return { errors: {}, errorSummary: [], userInput: {} }
        })

        const requestHandler = applicationsController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('applications/confirm', {
          pageHeading: `Confirm ${person.name}'s details`,
          ...person,
          date: DateFormats.dateObjtoUIDate(new Date()),
          dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
          errors: {},
          errorSummary: [],
        })
        expect(personService.findByCrn).toHaveBeenCalledWith(token, person.crn)
        expect(request.flash).toHaveBeenCalledWith('crn')
      })

      it('renders the form with errors and user input if an error has been sent to the flash', async () => {
        personService.findByCrn.mockResolvedValue(person)
        const errorsAndUserInput = createMock<ErrorsAndUserInput>()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

        const requestHandler = applicationsController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('applications/confirm', {
          pageHeading: `Confirm ${person.name}'s details`,
          ...person,
          date: DateFormats.dateObjtoUIDate(new Date()),
          dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          ...errorsAndUserInput.userInput,
        })
        expect(request.flash).toHaveBeenCalledWith('crn')
      })
    })

    describe('if there isnt a CRN present in the flash', () => {
      beforeEach(() => {
        request = createMock<Request>({
          user: { token },
          flash: jest.fn().mockReturnValue([]),
        })
      })

      it('renders the CRN lookup page', async () => {
        ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
          return { errors: {}, errorSummary: [], userInput: {} }
        })

        const requestHandler = applicationsController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('applications/new', {
          pageHeading: "Enter the individual's CRN",
          errors: {},
          errorSummary: [],
        })
      })
      it('renders the form with errors and user input if an error has been sent to the flash', async () => {
        const errorsAndUserInput = createMock<ErrorsAndUserInput>()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

        const requestHandler = applicationsController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('applications/new', {
          pageHeading: "Enter the individual's CRN",
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          ...errorsAndUserInput.userInput,
        })
      })
    })
  })

  describe('create', () => {
    let application: Application

    beforeEach(() => {
      request = createMock<Request>({
        user: { token },
      })
      request.body.crn = 'some-crn'
      application = applicationFactory.build()
    })

    it('creates an application and redirects to the first page of the first step', async () => {
      applicationService.createApplication.mockResolvedValue(application)

      const requestHandler = applicationsController.create()

      await requestHandler(request, response, next)

      expect(applicationService.createApplication).toHaveBeenCalledWith('SOME_TOKEN', 'some-crn')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'sentence-type' }),
      )
    })

    it('saves the application to the session', async () => {
      applicationService.createApplication.mockResolvedValue(application)

      const requestHandler = applicationsController.create()

      await requestHandler(request, response, next)

      expect(request.session.application).toEqual(application)
    })
  })
})
