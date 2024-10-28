import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { ApAreaService, PremisesService } from '../../../services'
import PremisesController from './premisesController'

import {
  apAreaFactory,
  cas1PremisesBasicSummaryFactory,
  cas1PremisesSummaryFactory,
  cas1SpaceBookingSummaryFactory,
} from '../../../testutils/factories'

describe('V2PremisesController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'some-uuid'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const apAreaService = createMock<ApAreaService>({})
  const premisesController = new PremisesController(premisesService, apAreaService)

  beforeEach(() => {
    request = createMock<Request>({ user: { token }, params: { premisesId } })
    jest.useFakeTimers()
  })

  describe('show', () => {
    it('should render the premises detail and list of placements', async () => {
      const premisesSummary = cas1PremisesSummaryFactory.build()
      const placementList = cas1SpaceBookingSummaryFactory.buildList(3)
      premisesService.find.mockResolvedValue(premisesSummary)
      premisesService.getPlacements.mockResolvedValue(placementList)
      const hrefPrefix = `/manage/premises/${premisesId}?activeTab=upcoming&sortBy=personName&sortDirection=asc&`
      const sortParameters = { sortDirection: 'asc', sortBy: 'personName', activeTab: 'upcoming', hrefPrefix }
      request = createMock<Request>({
        user: { token },
        params: { premisesId },
        query: { ...sortParameters, page: '1' },
      })

      const requestHandler = premisesController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/show', {
        premises: premisesSummary,
        ...sortParameters,
        pageNumber: 1,
        placements: placementList,
      })
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
    })
  })

  describe('index', () => {
    it('should render the template with the premises and areas', async () => {
      const premisesSummaries = cas1PremisesBasicSummaryFactory.buildList(1)

      const apAreas = apAreaFactory.buildList(1)

      apAreaService.getApAreas.mockResolvedValue(apAreas)
      premisesService.getCas1All.mockResolvedValue(premisesSummaries)

      const requestHandler = premisesController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/index', {
        premisesSummaries,
        areas: apAreas,
        selectedArea: '',
      })

      expect(premisesService.getCas1All).toHaveBeenCalledWith(token, undefined)
      expect(apAreaService.getApAreas).toHaveBeenCalledWith(token)
    })

    it('should call the premises service with the AP area ID if supplied', async () => {
      const areaId = 'ap-area-id'
      const premisesSummaries = cas1PremisesBasicSummaryFactory.buildList(1)
      const areas = apAreaFactory.buildList(1)

      apAreaService.getApAreas.mockResolvedValue(areas)
      premisesService.getCas1All.mockResolvedValue(premisesSummaries)

      const requestHandler = premisesController.index()
      await requestHandler({ ...request, body: { selectedArea: areaId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/index', {
        premisesSummaries,
        areas,
        selectedArea: areaId,
      })

      expect(premisesService.getCas1All).toHaveBeenCalledWith(token, { apAreaId: areaId })
      expect(apAreaService.getApAreas).toHaveBeenCalledWith(token)
    })
  })
})
