import type { Request, RequestHandler, Response } from 'express'

import { PlacementApplicationService } from '../../services'

import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import placementApplicationPaths from '../../paths/placementApplications'
import { applicationShowPageTab } from '../../utils/applications/utils'
import { WithdrawPlacementRequestReason } from '../../@types/shared/models/WithdrawPlacementRequestReason'
import { Application } from '../../@types/shared'

export default class WithdrawalsController {
  constructor(private readonly placementApplicationService: PlacementApplicationService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const placementApplication = await this.placementApplicationService.getPlacementApplication(
        req.user.token,
        req.params.id,
      )

      return res.render('placement-applications/withdraw/new', {
        pageHeading: 'Why is this placement request being withdrawn?',
        placementApplicationId: placementApplication.id,
        applicationId: placementApplication.applicationId,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        const { reason, applicationId } = req.body as {
          reason: WithdrawPlacementRequestReason | undefined
          applicationId: Application['id'] | undefined
        }

        await this.placementApplicationService.withdraw(req.user.token, req.params.id, reason)

        req.flash('success', 'Placement application withdrawn')

        return res.redirect(applicationShowPageTab(applicationId, 'placementRequests'))
      } catch (err) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          placementApplicationPaths.placementApplications.withdraw.new({ id: req.params.id }),
        )
      }
    }
  }
}
