import { type Request, RequestHandler, type Response } from 'express'
import { Cas1NewDeparture } from '@approved-premises/api'
import { DepartureFormData, ObjectWithDateParts } from '@approved-premises/ui'
import { PlacementService, PremisesService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import {
  DateFormats,
  dateAndTimeInputsAreValidDates,
  dateIsInThePast,
  isToday,
  timeIsValid24hrFormat,
} from '../../../../utils/dateUtils'
import { ValidationError } from '../../../../utils/errors'
import paths from '../../../../paths/manage'
import { BREACH_OR_RECALL_REASON_ID, PLANNED_MOVE_ON_REASON_ID } from '../../../../utils/placements'

type DepartureFormErrors = {
  [K in keyof DepartureFormData]: string
}

export default class DeparturesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly placementService: PlacementService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const departureData = this.placementService.getDepartureSessionData(placementId, req.session)
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const placement = await this.premisesService.getPlacement({ token, premisesId, placementId })
      const departureReasons = (await this.placementService.getDepartureReasons(token)).filter(reason => !reason.parent)

      return res.render('manage/premises/placements/departure/new', {
        placement,
        departureReasons,
        errors,
        errorSummary,
        errorTitle,
        ...departureData,
        ...userInput,
      })
    }
  }

  private newErrors(body: DepartureFormData): DepartureFormErrors | null {
    const errors: DepartureFormErrors = {}

    const { departureTime, reasonId } = body
    const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(
      body as ObjectWithDateParts<'departureDate'>,
      'departureDate',
    )

    if (!departureDate) {
      errors.departureDate = 'You must enter a date of departure'
    } else if (!dateAndTimeInputsAreValidDates(body as ObjectWithDateParts<'departureDate'>, 'departureDate')) {
      errors.departureDate = 'You must enter a valid date of departure'
    } else if (!dateIsInThePast(departureDate)) {
      errors.departureDate = 'The date of departure must be today or in the past'
    }

    if (!departureTime) {
      errors.departureTime = 'You must enter a time of departure'
    } else if (!timeIsValid24hrFormat(departureTime)) {
      errors.departureTime = 'You must enter a valid time of departure in 24-hour format'
    } else if (isToday(departureDate)) {
      const [hours, minutes] = departureTime.split(':').map(Number)
      const now = new Date()

      now.setHours(hours, minutes)

      if (!dateIsInThePast(now.toISOString())) {
        errors.departureTime = 'The time of departure must be in the past'
      }
    }

    if (!reasonId) {
      errors.reasonId = 'You must select a reason'
    }

    return Object.keys(errors).length ? errors : null
  }

  saveNew(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        const errors = this.newErrors(req.body)

        if (errors) {
          throw new ValidationError(errors)
        }

        this.placementService.setDepartureSessionData(placementId, req.session, req.body)

        let redirect = paths.premises.placements.departure.notes({ premisesId, placementId })

        if (req.body.reasonId === BREACH_OR_RECALL_REASON_ID) {
          redirect = paths.premises.placements.departure.breachOrRecallReason({
            premisesId,
            placementId,
          })
        }

        if (req.body.reasonId === PLANNED_MOVE_ON_REASON_ID) {
          redirect = paths.premises.placements.departure.moveOnCategory({ premisesId, placementId })
        }

        return res.redirect(redirect)
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.placements.departure.new({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }

  breachOrRecallReason(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params

      const departureData = this.placementService.getDepartureSessionData(placementId, req.session)

      if (this.newErrors(departureData) || departureData.reasonId !== BREACH_OR_RECALL_REASON_ID) {
        return res.redirect(paths.premises.placements.departure.new({ premisesId, placementId }))
      }

      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const placement = await this.premisesService.getPlacement({ token, premisesId, placementId })
      const departureReasons = (await this.placementService.getDepartureReasons(token)).filter(
        reason => !!reason.parent,
      )

      return res.render('manage/premises/placements/departure/breach-or-recall', {
        placement,
        departureReasons,
        errors,
        errorSummary,
        errorTitle,
        ...departureData,
        ...userInput,
      })
    }
  }

  saveBreachOrRecallReason(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        const { breachOrRecallReasonId } = req.body

        if (!breachOrRecallReasonId) {
          throw new ValidationError({ breachOrRecallReasonId: 'You must select a breach or recall reason' })
        }

        this.placementService.setDepartureSessionData(placementId, req.session, req.body)

        return res.redirect(paths.premises.placements.departure.notes({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.placements.departure.breachOrRecallReason({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }

  moveOnCategory(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params

      const departureData = this.placementService.getDepartureSessionData(placementId, req.session)

      if (this.newErrors(departureData) || departureData.reasonId !== PLANNED_MOVE_ON_REASON_ID) {
        return res.redirect(paths.premises.placements.departure.new({ premisesId, placementId }))
      }

      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const placement = await this.premisesService.getPlacement({ token, premisesId, placementId })
      const moveOnCategories = await this.placementService.getMoveOnCategories(token)

      return res.render('manage/premises/placements/departure/move-on-category', {
        placement,
        moveOnCategories,
        errors,
        errorSummary,
        errorTitle,
        ...departureData,
        ...userInput,
      })
    }
  }

  saveMoveOnCategory(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        const { moveOnCategoryId } = req.body

        if (!moveOnCategoryId) {
          throw new ValidationError({ moveOnCategoryId: 'You must select a move on category' })
        }

        this.placementService.setDepartureSessionData(placementId, req.session, req.body)

        return res.redirect(paths.premises.placements.departure.notes({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.placements.departure.moveOnCategory({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }

  notes(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params

      const departureData = this.placementService.getDepartureSessionData(placementId, req.session)

      if (this.newErrors(departureData)) {
        return res.redirect(paths.premises.placements.departure.new({ premisesId, placementId }))
      }

      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const placement = await this.premisesService.getPlacement({ token, premisesId, placementId })

      let backlink = paths.premises.placements.departure.new({ premisesId, placementId })
      if (departureData.reasonId === BREACH_OR_RECALL_REASON_ID) {
        backlink = paths.premises.placements.departure.breachOrRecallReason({ premisesId, placementId })
      } else if (departureData.reasonId === PLANNED_MOVE_ON_REASON_ID) {
        backlink = paths.premises.placements.departure.moveOnCategory({ premisesId, placementId })
      }

      return res.render('manage/premises/placements/departure/notes', {
        backlink,
        placement,
        errors,
        errorSummary,
        errorTitle,
        ...departureData,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      const departureData = this.placementService.getDepartureSessionData(placementId, req.session)
      const { notes } = req.body

      try {
        let { reasonId, moveOnCategoryId } = departureData

        if (reasonId === BREACH_OR_RECALL_REASON_ID) {
          reasonId = departureData.breachOrRecallReasonId
        }

        if (reasonId !== PLANNED_MOVE_ON_REASON_ID) {
          moveOnCategoryId = undefined
        }

        const placementDeparture: Cas1NewDeparture = {
          departureDateTime: DateFormats.dateAndTimeInputsToIsoString(
            {
              ...departureData,
              'departureDate-time': departureData.departureTime,
            } as ObjectWithDateParts<'departureDate'>,
            'departureDate',
          ).departureDate,
          reasonId,
          moveOnCategoryId,
          notes,
        }

        await this.placementService.createDeparture(req.user.token, premisesId, placementId, placementDeparture)

        this.placementService.removeDepartureSessionData(placementId, req.session)
        req.flash('success', 'You have recorded this person as departed')
        return res.redirect(paths.premises.placements.show({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.placements.departure.notes({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }
}
