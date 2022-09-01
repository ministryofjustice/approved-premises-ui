import parseISO from 'date-fns/parseISO'
import type { Departure, Booking } from 'approved-premises'
import Page from './page'
import paths from '../../server/paths'

export default class DepartureConfirmation extends Page {
  constructor() {
    super('Departure confirmed')
  }

  static visit(premisesId: string, bookingId: string, departureId: string): DepartureConfirmation {
    cy.visit(paths.bookings.departures.confirm({ premisesId, bookingId, departureId }))

    return new DepartureConfirmation()
  }

  verifyConfirmedDepartureIsVisible(departure: Departure, booking: Booking): void {
    cy.get('dl').within(() => {
      this.assertDefinition('Name', booking.name)
      this.assertDefinition('CRN', booking.crn)
      this.assertDefinition('Departure date', parseISO(departure.dateTime).toLocaleDateString('en-GB'))
      this.assertDefinition('Reason', departure.reason.name)
      this.assertDefinition('Destination approved premises', departure.destinationAp.name)
      this.assertDefinition('Destination provider', departure.destinationProvider.name)
      this.assertDefinition('Move on category', departure.moveOnCategory.name)
      this.assertDefinition('Notes', departure.notes)
    })
  }
}
