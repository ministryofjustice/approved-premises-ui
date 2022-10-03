import type { Cancellation, NewCancellation, ReferenceData } from 'approved-premises'
import { RestClientBuilder } from '../../data'
import type { BookingClient, ReferenceDataClient } from '../../data/approved-premises'

export default class CancellationService {
  constructor(
    private readonly bookingClientFactory: RestClientBuilder<BookingClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async createCancellation(
    token: string,
    premisesId: string,
    bookingId: string,
    cancellation: NewCancellation,
  ): Promise<Cancellation> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedCancellation = await bookingClient.cancel(premisesId, bookingId, cancellation)

    return confirmedCancellation
  }

  async getCancellation(
    token: string,
    premisesId: string,
    bookingId: string,
    cancellationId: string,
  ): Promise<Cancellation> {
    const bookingClient = this.bookingClientFactory(token)

    const booking = await bookingClient.findCancellation(premisesId, bookingId, cancellationId)

    return booking
  }

  async getCancellationReasons(token: string): Promise<Array<ReferenceData>> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    const reasons = await referenceDataClient.getReferenceData('cancellation-reasons')

    return reasons as Array<ReferenceData>
  }
}
