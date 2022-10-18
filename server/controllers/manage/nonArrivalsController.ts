import { Response, Request, RequestHandler } from 'express'

import type { Nonarrival } from '@approved-premises-shared'

import { DateFormats } from '../../utils/dateUtils'
import NonArrivalService from '../../services/nonArrivalService'
import { catchValidationErrorOrPropogate } from '../../utils/validation'
import paths from '../../paths/manage'

export default class NonArrivalsController {
  constructor(private readonly nonArrivalService: NonArrivalService) {}

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const { nonArrivalDate } = DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'nonArrivalDate')

      const nonArrival: Omit<Nonarrival, 'id' | 'bookingId'> = {
        ...req.body.nonArrival,
        date: nonArrivalDate,
      }

      try {
        await this.nonArrivalService.createNonArrival(req.user.token, premisesId, bookingId, nonArrival)

        req.flash('success', 'Non-arrival logged')
        res.redirect(paths.premises.show({ premisesId }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.bookings.arrivals.new({ premisesId, bookingId }))
      }
    }
  }
}
