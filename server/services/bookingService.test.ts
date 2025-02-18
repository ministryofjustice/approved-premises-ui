import BookingService from './bookingService'
import BookingClient from '../data/bookingClient'

import { bookingExtensionFactory, bookingFactory, dateChangeFactory } from '../testutils/factories'

jest.mock('../data/bookingClient.ts')
jest.mock('../data/referenceDataClient.ts')

describe('BookingService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>

  const bookingClientFactory = jest.fn()

  const service = new BookingService(bookingClientFactory)
  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('find', () => {
    it('on success returns the booking that has been requested', async () => {
      const arrivalDate = new Date(2022, 2, 11)
      const departureDate = new Date(2022, 2, 12)

      const booking = bookingFactory.build({
        arrivalDate: arrivalDate.toISOString(),
        departureDate: departureDate.toISOString(),
      })

      bookingClient.find.mockResolvedValue(booking)

      const retrievedBooking = await service.find(token, 'premisesId', booking.id)
      expect(retrievedBooking).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.find).toHaveBeenCalledWith('premisesId', booking.id)
    })
  })

  describe('findWithoutPremises', () => {
    it('on success returns the booking that has been requested', async () => {
      const booking = bookingFactory.build()

      bookingClient.findWithoutPremises.mockResolvedValue(booking)

      const retrievedBooking = await service.findWithoutPremises(token, booking.id)
      expect(retrievedBooking).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.findWithoutPremises).toHaveBeenCalledWith(booking.id)
    })
  })

  describe('extendBooking', () => {
    it('on success returns the booking that has been extended', async () => {
      const booking = bookingExtensionFactory.build()
      bookingClient.extendBooking.mockResolvedValue(booking)
      const newDepartureDateObj = {
        newDepartureDate: new Date(2042, 13, 11).toISOString(),
        'newDepartureDate-year': '2042',
        'newDepartureDate-month': '12',
        'newDepartureDate-day': '11',
        notes: 'Some notes',
      }

      const extendedBooking = await service.changeDepartureDate(token, 'premisesId', booking.id, newDepartureDateObj)

      expect(extendedBooking).toEqual(booking)
      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.extendBooking).toHaveBeenCalledWith('premisesId', booking.id, newDepartureDateObj)
    })
  })

  describe('changeDates', () => {
    it('on success returns the arrival that has been posted', async () => {
      const payload = dateChangeFactory.build()

      await service.changeDates(token, 'premisesID', 'bookingId', payload)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.changeDates).toHaveBeenCalledWith('premisesID', 'bookingId', payload)
    })
  })
})
