import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import BookingService from '../../services/bookingService'
import BookingExtensionsController from './bookingExtensionsController'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import { bookingExtensionFactory, bookingFactory } from '../../testutils/factories'
import paths from '../../paths/manage'

jest.mock('../../utils/validation')

describe('bookingExtensionsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingService = createMock<BookingService>({})
  const bookingExtensionsController = new BookingExtensionsController(bookingService)
  const premisesId = 'premisesId'
  const booking = bookingFactory.build()

  describe('new', () => {
    beforeEach(() => {
      bookingService.find.mockResolvedValue(booking)
    })

    it('should render the form', async () => {
      const requestHandler = bookingExtensionsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      await requestHandler({ ...request, params: { premisesId, bookingId: booking.id } }, response, next)

      expect(response.render).toHaveBeenCalledWith('bookings/extensions/new', {
        pageHeading: 'Update departure date',
        premisesId,
        booking,
        errors: {},
        errorSummary: [],
      })
      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, booking.id)
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      bookingService.find.mockResolvedValue(booking)
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = bookingExtensionsController.new()

      await requestHandler({ ...request, params: { premisesId, bookingId: booking.id } }, response, next)

      expect(response.render).toHaveBeenCalledWith('bookings/extensions/new', {
        pageHeading: 'Update departure date',
        premisesId,
        booking,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, booking.id)
    })
  })

  describe('create', () => {
    const bookingExtension = bookingExtensionFactory.build({ bookingId: booking.id })

    it('given the expected form data, the posting of the booking is successful should redirect to the "confirmation" page', async () => {
      bookingService.changeDepartureDate.mockResolvedValue(bookingExtension)

      const requestHandler = bookingExtensionsController.create()

      request = {
        ...request,
        params: { premisesId, bookingId: bookingExtension.bookingId },
        body: {
          'newDepartureDate-day': '01',
          'newDepartureDate-month': '02',
          'newDepartureDate-year': '2022',
        },
      }

      await requestHandler(request, response, next)

      expect(bookingService.changeDepartureDate).toHaveBeenCalledWith(token, premisesId, bookingExtension.bookingId, {
        ...request.body,
        newDepartureDate: '2022-02-01',
      })

      expect(response.redirect).toHaveBeenCalledWith(
        paths.bookings.extensions.confirm({
          premisesId,
          bookingId: bookingExtension.bookingId,
        }),
      )
    })

    it('should render the page with errors when the API returns an error', async () => {
      bookingService.changeDepartureDate.mockResolvedValue(bookingExtension)
      const requestHandler = bookingExtensionsController.create()

      request = {
        ...request,
        params: { premisesId, bookingId: bookingExtension.id },
      }

      const err = new Error()

      bookingService.changeDepartureDate.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.extensions.new({
          premisesId,
          bookingId: bookingExtension.id,
        }),
      )
    })
  })

  describe('confirm', () => {
    it('renders the form with the details from the booking that is requested', async () => {
      bookingService.find.mockResolvedValue(booking)

      const requestHandler = bookingExtensionsController.confirm()

      request = {
        ...request,
        params: {
          premisesId,
          bookingId: booking.id,
        },
      }

      await requestHandler(request, response, next)

      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, booking.id)
      expect(response.render).toHaveBeenCalledWith('bookings/extensions/confirm', {
        pageHeading: 'Departure date updated',
        premisesId,
        ...booking,
      })
    })
  })
})
