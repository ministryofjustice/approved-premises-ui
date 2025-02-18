import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas1SpaceBookingCharacteristic, Cas1SpaceBookingDaySummary } from '@approved-premises/api'
import { occupancyCriteriaMap } from '../../utils/match/occupancy'
import { fullPersonSummaryFactory } from './person'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1SpaceBookingDaySummary>(() => {
  const essentialCharacteristics = faker.helpers.arrayElements(
    Object.keys(occupancyCriteriaMap),
  ) as Array<Cas1SpaceBookingCharacteristic>
  return {
    id: faker.string.uuid(),
    person: fullPersonSummaryFactory.build(),
    canonicalArrivalDate: DateFormats.dateObjToIsoDate(faker.date.recent({ days: 90 })),
    canonicalDepartureDate: DateFormats.dateObjToIsoDate(faker.date.soon({ days: 90 })),
    tier: faker.helpers.arrayElement(['A', 'B', 'C']),
    releaseType: faker.helpers.arrayElement(['ROTL', 'HDC', 'PSS', 'Parole', 'Priority']),
    essentialCharacteristics,
  }
})
