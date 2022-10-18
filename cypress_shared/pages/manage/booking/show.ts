import type { Booking } from '@approved-premises-ui'

import Page from '../../page'
import paths from '../../../../server/paths/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'

export default class BookingShowPage extends Page {
  constructor() {
    super('Booking details')
  }

  static visit(premisesId: string, booking: Booking): BookingShowPage {
    cy.visit(paths.bookings.show({ premisesId, bookingId: booking.id }))
    return new BookingShowPage()
  }

  clickExtendBooking() {
    cy.get('.moj-button-menu__toggle-button')
      .click()
      .then(() => cy.get('a').contains('Extend booking').click())
  }

  shouldShowBookingDetails(booking: Booking): void {
    cy.get('dl[data-cy-dates]').within(() => {
      this.assertDefinition('Arrival date', DateFormats.isoDateToUIDate(booking.arrivalDate))
      this.assertDefinition('Departure date', DateFormats.isoDateToUIDate(booking.departureDate))
    })

    cy.get('dl[data-cy-arrival-information]').within(() => {
      this.assertDefinition('Arrival date', DateFormats.isoDateToUIDate(booking.arrival.arrivalDate))
      this.assertDefinition('Departure date', DateFormats.isoDateToUIDate(booking.arrival.expectedDepartureDate))
      this.assertDefinition('Notes', booking.arrival.notes)
    })

    cy.get('dl[data-cy-departure-information]').within(() => {
      this.assertDefinition('Actual departure date', DateFormats.isoDateToUIDate(booking.departure.dateTime))
      this.assertDefinition('Reason', booking.departure.reason.name)
      this.assertDefinition('Notes', booking.departure.notes)
    })
  }
}
