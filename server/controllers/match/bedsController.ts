import type { Request, RequestHandler, Response } from 'express'
import { BedSearchParametersUi } from '../../@types/ui'
import { PersonService } from '../../services'
import BedService from '../../services/bedService'

export default class BedController {
  constructor(private readonly bedService: BedService, private readonly personService: PersonService) {}

  search(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        durationDays,
        maxDistanceMiles,
        postcodeDistrict,
        requiredPremisesCharacteristics,
        requiredRoomCharacteristics,
        startDate,
        crn,
      } = req.query

      const results = await this.bedService.search(req.user.token, {
        durationDays,
        maxDistanceMiles,
        postcodeDistrict,
        requiredPremisesCharacteristics,
        requiredRoomCharacteristics,
        startDate,
      } as BedSearchParametersUi)
      const person = await this.personService.findByCrn(req.user.token, crn as string)

      res.render('match/search', {
        pageHeading: 'Find a bed',
        results,
        person,
      })
    }
  }
}
