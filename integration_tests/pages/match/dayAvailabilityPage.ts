import { Cas1PremiseCapacityForDay, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import Page from '../page'
import {
  dayAvailabilityCount,
  dayAvailabilityStatus,
  dayAvailabilityStatusMap,
} from '../../../server/utils/match/occupancy'
import { DateFormats } from '../../../server/utils/dateUtils'
import { roomCharacteristicMap } from '../../../server/utils/characteristicsUtils'

type Availability = 'Available' | 'Overbooked' | 'Available for your criteria'

export default class DayAvailabilityPage extends Page {
  availability: Availability

  constructor(
    private readonly dayCapacity: Cas1PremiseCapacityForDay,
    private readonly criteria: Array<Cas1SpaceBookingCharacteristic> = [],
  ) {
    const availability = dayAvailabilityStatusMap[dayAvailabilityStatus(dayCapacity, criteria)] as Availability

    super(availability)

    this.availability = availability
  }

  shouldShowDayAvailability() {
    const uiDate = DateFormats.isoDateToUIDate(this.dayCapacity.date, { format: 'long' })
    cy.get('h2').should('contain.text', uiDate)

    if (this.availability === 'Available') {
      cy.get('p').contains('The space you require is available.')
    } else if (this.availability === 'Overbooked') {
      cy.get('p').contains('This AP is full or overbooked. The space you require is not available.')
    } else if (this.availability === 'Available for your criteria') {
      cy.get('p').contains(
        'This AP is full or overbooked, but the space you require is available as it is occupied by someone who does not need it.',
      )
    }

    const summaryList = {
      'AP capacity': this.dayCapacity.totalBedCount,
      'Booked spaces': this.dayCapacity.bookingCount,
    }

    if (this.criteria.length) {
      this.criteria.forEach(criteria => {
        const criteriaLabel = roomCharacteristicMap[criteria]
        const criteriaAvailability = this.dayCapacity.characteristicAvailability.find(
          characteristic => characteristic.characteristic === criteria,
        )
        summaryList[`${criteriaLabel} spaces available`] =
          criteriaAvailability.availableBedsCount - criteriaAvailability.bookingsCount
      })
    } else {
      summaryList['Available spaces'] = dayAvailabilityCount(this.dayCapacity)
    }
    this.shouldContainAvailabilitySummary(summaryList)
  }

  shouldContainAvailabilitySummary(items: Record<string, string | number>) {
    Object.entries(items).forEach(([key, value]) => {
      cy.get('.govuk-summary-list__key')
        .contains(key)
        .siblings('.govuk-summary-list__value')
        .should('contain.text', value)
    })
  }
}
