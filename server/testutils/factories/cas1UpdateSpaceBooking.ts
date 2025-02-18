import { Cas1UpdateSpaceBooking } from '@approved-premises/api'
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { occupancyCriteriaMap } from '../../utils/match/occupancy'
import { DateFormats } from '../../utils/dateUtils'
import { SpaceSearchRoomCriteria } from '../../utils/match/spaceSearch'

export default Factory.define<Cas1UpdateSpaceBooking>(() => {
  const arrivalDate = faker.date.soon()
  const departureDate = faker.date.soon({ refDate: arrivalDate })

  return {
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    departureDate: DateFormats.dateObjToIsoDate(departureDate),
    characteristics: faker.helpers.arrayElements(Object.keys(occupancyCriteriaMap)) as Array<SpaceSearchRoomCriteria>,
  }
})
