import type {
  ApprovedPremisesSummary,
  BedDetail,
  BedSummary,
  ExtendedPremisesSummary,
  Premises,
  Room,
  StaffMember,
} from '@approved-premises/api'
import type { PremisesClient, RestClientBuilder } from '../data'

import { mapApiOccupancyToUiOccupancy } from '../utils/premises'

export default class PremisesService {
  constructor(private readonly premisesClientFactory: RestClientBuilder<PremisesClient>) {}

  async getAll(token: string, selectedAreaId = ''): Promise<Array<ApprovedPremisesSummary>> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.all(selectedAreaId)

    return premises.sort((a, b) => {
      if (a.name < b.name) {
        return -1
      }
      if (a.name > b.name) {
        return 1
      }
      return 0
    })
  }

  async getStaffMembers(token: string, premisesId: string): Promise<Array<StaffMember>> {
    const premisesClient = this.premisesClientFactory(token)

    const staffMembers = await premisesClient.getStaffMembers(premisesId)

    return staffMembers
  }

  async getRooms(token: string, premisesId: string): Promise<Array<Room>> {
    const premisesClient = this.premisesClientFactory(token)

    const rooms = await premisesClient.getRooms(premisesId)

    return rooms
  }

  async getBeds(token: string, premisesId: string): Promise<Array<BedSummary>> {
    const premisesClient = this.premisesClientFactory(token)

    return premisesClient.getBeds(premisesId)
  }

  async getBed(token: string, premisesId: string, bedId: string): Promise<BedDetail> {
    const premisesClient = this.premisesClientFactory(token)

    return premisesClient.getBed(premisesId, bedId)
  }

  async getRoom(token: string, premisesId: string, roomId: string): Promise<Room> {
    const premisesClient = this.premisesClientFactory(token)

    const room = await premisesClient.getRoom(premisesId, roomId)

    return room
  }

  async find(token: string, id: string): Promise<Premises> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.find(id)

    return premises
  }

  async getPremisesDetails(token: string, id: string): Promise<ExtendedPremisesSummary> {
    const premisesClient = this.premisesClientFactory(token)
    return premisesClient.summary(id)
  }

  async getOccupancy(token: string, premisesId: string, startDate: string, endDate: string) {
    const premisesClient = this.premisesClientFactory(token)
    const apiOccupancy = await premisesClient.calendar(premisesId, startDate, endDate)
    const occupancyForUi = await mapApiOccupancyToUiOccupancy(apiOccupancy)

    return occupancyForUi
  }
}
