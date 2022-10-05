import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import premisesFactory from '../../../testutils/factories/premises'
import PremisesService from '../../../services/premisesService'
import PremisesController from './premisesController'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate } from '../../../utils/validation'

jest.mock('../../../utils/validation')

describe('PremisesController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const premisesController = new PremisesController(premisesService)

  describe('new', () => {
    it('show render the form', async () => {
      const requestHandler = premisesController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/new')
    })
  })

  describe('create', () => {
    it('creates a premises and redirects to the new premises page', async () => {
      const requestHandler = premisesController.create()

      const premises = premisesFactory.build()

      request.body = {
        name: premises.name,
        apCode: premises.apCode,
        postcode: premises.postcode,
        bedCount: premises.bedCount.toString(),
        availableBedsForToday: premises.availableBedsForToday,
      }

      await requestHandler(request, response, next)

      expect(premisesService.create).toHaveBeenCalledWith(token, {
        name: premises.name,
        apCode: premises.apCode,
        postcode: premises.postcode,
        bedCount: premises.bedCount,
        availableBedsForToday: premises.availableBedsForToday,
      })

      expect(request.flash).toHaveBeenCalledWith('success', 'Property created')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.new({}))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = premisesController.create()

      const err = new Error()

      premisesService.create.mockImplementation(() => {
        throw err
      })

      request.body = {
        county: 'some county',
        town: 'some town',
        type: 'single',
        address: 'some address',
      }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, paths.premises.new({}))
    })
  })
})
