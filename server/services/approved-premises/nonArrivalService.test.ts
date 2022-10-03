import type { NonArrival } from 'approved-premises'

import NonArrivalService from './nonArrivalService'
import BookingClient from '../../data/approved-premises/bookingClient'
import NonArrivalFactory from '../../testutils/factories/nonArrival'

jest.mock('../../data/approved-premises/bookingClient.ts')

describe('NonArrivalService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const bookingClientFactory = jest.fn()

  const service = new NonArrivalService(bookingClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('createNonArrival', () => {
    it('on success returns the arrival that has been posted', async () => {
      const nonArrival: NonArrival = NonArrivalFactory.build()
      bookingClient.markNonArrival.mockResolvedValue(nonArrival)

      const postedNonArrival = await service.createNonArrival(token, 'premisesID', 'bookingId', nonArrival)

      expect(postedNonArrival).toEqual(nonArrival)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.markNonArrival).toHaveBeenCalledWith('premisesID', 'bookingId', nonArrival)
    })
  })
})
