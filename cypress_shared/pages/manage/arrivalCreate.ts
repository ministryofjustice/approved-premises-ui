import type { Arrival, Nonarrival } from '@approved-premises-shared'

import Page from '../page'
import paths from '../../../server/paths/manage'

export default class ArrivalCreatePage extends Page {
  constructor(private readonly premisesId: string, private readonly bookingId: string) {
    super('Did the resident arrive?')
  }

  static visit(premisesId: string, bookingId: string): ArrivalCreatePage {
    cy.visit(paths.bookings.arrivals.new({ premisesId, bookingId }))
    return new ArrivalCreatePage(premisesId, bookingId)
  }

  public completeArrivalForm(arrival: Arrival, staffMemberId: string): void {
    cy.get('input[name="arrived"][value="Yes"]').check()

    cy.log('arrival', arrival)

    const arrivalDate = new Date(Date.parse(arrival.arrivalDate))
    const expectedDeparture = new Date(Date.parse(arrival.expectedDepartureDate))

    cy.get('input[name="arrivalDate-day"]').type(String(arrivalDate.getDate()))
    cy.get('input[name="arrivalDate-month"]').type(String(arrivalDate.getMonth() + 1))
    cy.get('input[name="arrivalDate-year"]').type(String(arrivalDate.getFullYear()))

    cy.get('input[name="expectedDepartureDate-day"]').type(String(expectedDeparture.getDate()))
    cy.get('input[name="expectedDepartureDate-month"]').type(String(expectedDeparture.getMonth() + 1))
    cy.get('input[name="expectedDepartureDate-year"]').type(String(expectedDeparture.getFullYear()))

    this.getLabel('Key Worker')
    this.getSelectInputByIdAndSelectAnEntry('keyWorkerStaffId', staffMemberId)

    cy.get('[name="arrival[notes]"]').type(arrival.notes)

    cy.get('[name="arrival[submit]"]').click()
  }

  public completeNonArrivalForm(nonArrival: Nonarrival): void {
    cy.get('input[name="arrived"][value="No"]').check()

    cy.log('nonArrival', nonArrival)

    const date = new Date(Date.parse(nonArrival.date))

    cy.get('input[name="nonArrivalDate-day"]').type(String(date.getDate()))
    cy.get('input[name="nonArrivalDate-month"]').type(String(date.getMonth() + 1))
    cy.get('input[name="nonArrivalDate-year"]').type(String(date.getFullYear()))

    cy.get('input[type="radio"]').last().check()

    cy.get('[name="nonArrival[notes]"]').type(nonArrival.notes)

    cy.get('[name="nonArrival[submit]"]').click()
  }

  public submitArrivalFormWithoutFields(): void {
    cy.get('input[name="arrived"][value="Yes"]').check()
    cy.get('[name="arrival[submit]"]').click()
  }

  public submitNonArrivalFormWithoutFields(): void {
    cy.get('input[name="arrived"][value="No"]').check()
    cy.get('[name="nonArrival[submit]"]').click()
  }
}
