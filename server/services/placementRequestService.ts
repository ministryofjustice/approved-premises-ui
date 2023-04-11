import { GroupedPlacementRequests } from '@approved-premises/ui'
import { PlacementRequest } from '@approved-premises/api'
import { RestClientBuilder } from '../data'
import PlacementRequestClient from '../data/placementRequestClient'

export default class PlacementRequestService {
  constructor(private readonly placementRequestClientFactory: RestClientBuilder<PlacementRequestClient>) {}

  async getAll(token: string): Promise<GroupedPlacementRequests> {
    const placementRequestClient = this.placementRequestClientFactory(token)

    const results = {
      notMatched: [],
      unableToMatch: [],
      matched: [],
    } as GroupedPlacementRequests

    const placementRequests = await placementRequestClient.all()

    placementRequests.forEach(placementRequest => {
      results[placementRequest.status].push(placementRequest)
    })

    return results
  }

  async getPlacementRequest(token: string, id: string): Promise<PlacementRequest> {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.find(id)
  }
}
