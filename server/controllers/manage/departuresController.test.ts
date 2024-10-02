import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { ErrorsAndUserInput } from '@approved-premises/ui'

import DepartureService, { DepartureReferenceData } from '../../services/departureService'
import DeparturesController from './departuresController'
import BookingService from '../../services/bookingService'
import { bookingFactory, departureFactory } from '../../testutils/factories'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/manage'

jest.mock('../../utils/validation')

describe('DeparturesController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const departureService = createMock<DepartureService>({})
  const bookingService = createMock<BookingService>({})

  const departuresController = new DeparturesController(departureService, bookingService)

  describe('new', () => {
    const booking = bookingFactory.build()
    const bookingId = 'bookingId'
    const premisesId = 'premisesId'

    beforeEach(() => {
      bookingService.find.mockResolvedValue(booking)
    })

    it('renders the form', async () => {
      const referenceData = createMock<DepartureReferenceData>()
      departureService.getReferenceData.mockResolvedValue(referenceData)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      const requestHandler = departuresController.new()

      request.params = {
        bookingId,
        premisesId,
      }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('departures/new', {
        premisesId,
        booking,
        referenceData,
        pageHeading: 'Log a departure',
        errorSummary: [],
        errors: {},
      })

      expect(bookingService.find).toHaveBeenCalledWith(token, 'premisesId', 'bookingId')
      expect(departureService.getReferenceData).toHaveBeenCalledWith(token)
    })

    it('renders the form with errors', async () => {
      const referenceData = createMock<DepartureReferenceData>()
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      departureService.getReferenceData.mockResolvedValue(referenceData)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = departuresController.new()

      request.params = {
        bookingId,
        premisesId,
      }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('departures/new', {
        premisesId,
        booking,
        referenceData,
        pageHeading: 'Log a departure',
        errorSummary: errorsAndUserInput.errorSummary,
        errors: errorsAndUserInput.errors,
        ...errorsAndUserInput.userInput,
      })

      expect(bookingService.find).toHaveBeenCalledWith(token, 'premisesId', 'bookingId')
    })
  })

  describe('create', () => {
    it('creates an Departure and redirects to the confirmation page', async () => {
      const departure = departureFactory.build()
      departureService.createDeparture.mockResolvedValue(departure)

      const requestHandler = departuresController.create()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      request.body = {
        'dateTime-year': 2022,
        'dateTime-month': 12,
        'dateTime-day': 11,
        'dateTime-time': '12:35',
        departure: {
          notes: 'Some notes',
          reason: 'Bed withdrawn',
          moveOnCategory: 'Custody',
          destinationProvider: 'London',
          destinationAp: 'Some AP',
          name: 'John Doe',
          crn: 'A123456',
        },
      }

      await requestHandler(request, response, next)

      const expectedDeparture = {
        ...request.body.departure,
        dateTime: new Date(2022, 11, 11, 12, 35).toISOString(),
      }

      expect(departureService.createDeparture).toHaveBeenCalledWith(
        token,
        request.params.premisesId,
        request.params.bookingId,
        expectedDeparture,
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Departure recorded')

      expect(response.redirect).toHaveBeenCalledWith(
        paths.bookings.show({ premisesId: request.params.premisesId, bookingId: request.params.bookingId }),
      )
    })

    it('should catch the validation errors when the API returns an error', async () => {
      const requestHandler = departuresController.create()

      const premisesId = 'premisesId'

      request.params = {
        bookingId: 'bookingId',
        premisesId,
      }

      const err = new Error()

      departureService.createDeparture.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.departures.new({
          premisesId: request.params.premisesId,
          bookingId: request.params.bookingId,
        }),
      )
    })
  })
})
