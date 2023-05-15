import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import BedsController from './bedSearchController'
import { bedSearchResultsFactory, placementRequestFactory } from '../../../testutils/factories'

import { BedService, PlacementRequestService } from '../../../services'
import { startDateObjFromParams } from '../../../utils/matchUtils'
import { mapPlacementRequestToBedSearchParams } from '../../../utils/placementRequests/utils'

import matchPaths from '../../../paths/match'

jest.mock('../../../utils/matchUtils')

describe('bedSearchController', () => {
  const token = 'SOME_TOKEN'
  const placementRequest = placementRequestFactory.build()
  const bedSearchResults = bedSearchResultsFactory.build()

  const request: DeepMocked<Request> = createMock<Request>({
    params: { id: placementRequest.id },
    user: { token },
    body: {},
  })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bedService = createMock<BedService>({})
  const placementRequestService = createMock<PlacementRequestService>({})

  let bedsController: BedsController

  const formPath = matchPaths.placementRequests.beds.search({ id: placementRequest.id })

  beforeEach(() => {
    jest.resetAllMocks()
    bedsController = new BedsController(bedService, placementRequestService)

    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)
    bedService.search.mockResolvedValue(bedSearchResults)
    ;(startDateObjFromParams as jest.Mock).mockReturnValue({ startDate: placementRequest.expectedArrival })
  })

  describe('search', () => {
    describe('body params are sent', () => {
      it('it should render the search template with body params taking precedence over the placement request params', async () => {
        const query = mapPlacementRequestToBedSearchParams(placementRequest)
        const body = { durationWeeks: '2' }

        const requestHandler = bedsController.search()

        await requestHandler({ ...request, body }, response, next)

        expect(response.render).toHaveBeenCalledWith('match/search', {
          pageHeading: 'Find a bed',
          bedSearchResults,
          placementRequest,
          tier: placementRequest.risks.tier.value.level,
          formPath,
          ...query,
          ...body,
        })
        expect(bedService.search).toHaveBeenCalledWith(token, { ...query, ...body })
        expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequest.id)
      })

      it('should handle when a single selectedRequiredCharacteristic is sent', async () => {
        const query = mapPlacementRequestToBedSearchParams(placementRequest)
        const body = { requiredCharacteristics: 'someRequiredCharacteristic' }

        const requestHandler = bedsController.search()

        await requestHandler({ ...request, body }, response, next)

        expect(response.render).toHaveBeenCalledWith('match/search', {
          pageHeading: 'Find a bed',
          bedSearchResults,
          placementRequest,
          tier: placementRequest.risks.tier.value.level,
          formPath,
          ...query,
          requiredCharacteristics: ['someRequiredCharacteristic'],
        })
        expect(bedService.search).toHaveBeenCalledWith(token, {
          ...query,
          ...{ requiredCharacteristics: ['someRequiredCharacteristic'] },
        })
        expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequest.id)
      })
    })

    describe('no body params are sent', () => {
      it('it should render the search template by searching with the placement request variables ', async () => {
        const query = mapPlacementRequestToBedSearchParams(placementRequest)
        const requestHandler = bedsController.search()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('match/search', {
          pageHeading: 'Find a bed',
          bedSearchResults,
          placementRequest,
          tier: placementRequest.risks.tier.value.level,
          formPath,
          ...query,
        })
        expect(bedService.search).toHaveBeenCalledWith(token, query)
        expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequest.id)
      })
    })
  })
})
