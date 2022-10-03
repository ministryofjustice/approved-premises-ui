import type { Booking, Person } from 'approved-premises'
import Page, { PageElement } from '../../page'
import paths from '../../../../server/paths/approved-premises/manage'

export default class BookingNewPage extends Page {
  constructor() {
    super('Make a booking')
  }

  static visit(premisesId: string): BookingNewPage {
    cy.visit(paths.bookings.new({ premisesId }))

    return new BookingNewPage()
  }

  verifyPersonIsVisible(person: Person): void {
    cy.get('dl').within(() => {
      this.assertDefinition('Name', person.name)
      this.assertDefinition('CRN', person.crn)
    })
  }

  arrivalDay(): PageElement {
    return cy.get('#arrivalDate-day')
  }

  arrivalMonth(): PageElement {
    return cy.get('#arrivalDate-month')
  }

  arrivalYear(): PageElement {
    return cy.get('#arrivalDate-year')
  }

  expectedDepartureDay(): PageElement {
    return cy.get('#departureDate-day')
  }

  expectedDepartureMonth(): PageElement {
    return cy.get('#departureDate-month')
  }

  expectedDepartureYear(): PageElement {
    return cy.get('#departureDate-year')
  }

  completeForm(booking: Booking): void {
    this.getLegend('What is the expected arrival date?')

    const arrivalDate = new Date(Date.parse(booking.arrivalDate))

    this.arrivalDay().type(arrivalDate.getDate().toString())
    this.arrivalMonth().type(`${arrivalDate.getMonth() + 1}`)
    this.arrivalYear().type(arrivalDate.getFullYear().toString())

    this.getLegend('What is the expected departure date?')

    const departureDate = new Date(Date.parse(booking.departureDate))

    this.expectedDepartureDay().type(departureDate.getDate().toString())
    this.expectedDepartureMonth().type(`${departureDate.getMonth() + 1}`)
    this.expectedDepartureYear().type(departureDate.getFullYear().toString())

    this.getLabel('Key Worker')
    this.getSelectInputByIdAndSelectAnEntry('keyWorkerId', booking.keyWorker.name)
  }
}
