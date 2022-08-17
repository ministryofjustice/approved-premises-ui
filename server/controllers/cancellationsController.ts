import type { Response, Request, RequestHandler } from 'express'

import type { CancellationDto } from 'approved-premises'

import { CancellationService, BookingService } from '../services'
import { fetchErrorsAndUserInput, catchValidationErrorOrPropogate } from '../utils/validation'
import { convertDateAndTimeInputsToIsoString } from '../utils/utils'

export default class CancellationsController {
  constructor(
    private readonly cancellationService: CancellationService,
    private readonly bookingService: BookingService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const booking = await this.bookingService.getBooking(premisesId, bookingId)
      const cancellationReasons = await this.cancellationService.getCancellationReasons()

      res.render('cancellations/new', {
        premisesId,
        bookingId,
        booking,
        cancellationReasons,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { date } = convertDateAndTimeInputsToIsoString(req.body, 'date')

      const cancellation = {
        ...req.body.cancellation,
        date,
      } as CancellationDto

      try {
        const { id } = await this.cancellationService.createCancellation(premisesId, bookingId, cancellation)
        res.redirect(`/premises/${premisesId}/bookings/${bookingId}/cancellations/${id}/confirmation`)
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          `/premises/${premisesId}/bookings/${bookingId}/cancellations/new`,
        )
      }
    }
  }
}
