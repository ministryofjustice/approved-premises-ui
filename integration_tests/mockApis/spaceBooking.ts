import type {
  Cas1SpaceBooking,
  Cas1SpaceBookingResidency,
  Cas1SpaceBookingSummary,
  TimelineEvent,
} from '@approved-premises/api'

import { PaginatedRequestParams, SortedRequestParams } from '@approved-premises/ui'
import { getMatchingRequests, stubFor } from './setup'
import paths from '../../server/paths/api'

export default {
  stubSpaceBookingCreate: (args: { placementRequestId: string; spaceBooking: Cas1SpaceBooking }) =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.placementRequests.spaceBookings.create({ id: args.placementRequestId }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.spaceBooking,
      },
    }),

  stubSpaceBookingShow: (placement: Cas1SpaceBooking) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.premises.placements.show({
          premisesId: placement.premises.id,
          placementId: placement.id,
        }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: placement,
      },
    }),

  stubSpaceBookingSummaryList: (
    args: {
      premisesId: string
      placements: Array<Cas1SpaceBookingSummary>
      residency?: Cas1SpaceBookingResidency
      crnOrName?: string
      keyWorkerStaffCode?: string
    } & Partial<PaginatedRequestParams> &
      Partial<SortedRequestParams>,
  ) => {
    const {
      page = 1,
      perPage = 20,
      sortBy = 'canonicalArrivalDate',
      sortDirection = 'asc',
      residency,
      crnOrName,
      keyWorkerStaffCode,
    } = args

    const queryParameters: Record<string, Record<'equalTo', string | number>> = {
      page: { equalTo: String(page) },
      perPage: { equalTo: String(perPage) },
      sortBy: { equalTo: sortBy },
      sortDirection: { equalTo: sortDirection },
    }
    if (residency) queryParameters.residency = { equalTo: residency }
    if (crnOrName) queryParameters.crnOrName = { equalTo: crnOrName }
    if (keyWorkerStaffCode) queryParameters.keyWorkerStaffCode = { equalTo: keyWorkerStaffCode }

    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: paths.premises.placements.index({ premisesId: args.premisesId }),
        queryParameters,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Pagination-PageSize': String(perPage),
          'X-Pagination-TotalPages': String(Math.ceil(args.placements.length / perPage)),
          'X-Pagination-TotalResults': String(args.placements.length),
        },
        jsonBody: args.placements.slice(0, perPage),
      },
    })
  },

  stubSpaceBookingArrivalCreate: (args: { premisesId: string; placementId: string }) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: paths.premises.placements.arrival({ premisesId: args.premisesId, placementId: args.placementId }),
      },
      response: {
        status: 200,
      },
    }),

  stubSpaceBookingAssignKeyworker: placement =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: paths.premises.placements.keyworker({
          premisesId: placement.premises.id,
          placementId: placement.id,
        }),
      },
      response: {
        status: 200,
      },
    }),

  stubSpaceBookingNonArrival: placement =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: paths.premises.placements.nonArrival({
          premisesId: placement.premises.id,
          placementId: placement.id,
        }),
      },
      response: {
        status: 200,
      },
    }),

  stubSpaceBookingDepartureCreate: (placement: Cas1SpaceBooking) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: paths.premises.placements.departure({
          premisesId: placement.premises.id,
          placementId: placement.id,
        }),
      },
      response: {
        status: 200,
      },
    }),

  stubSpaceBookingGetWithoutPremises: (placement: Cas1SpaceBooking) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.placements.placementWithoutPremises({
          placementId: placement.id,
        }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: placement,
      },
    }),

  stubSpaceBookingTimeline: (args: { placementId: string; premisesId: string; timeline: Array<TimelineEvent> }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.premises.placements.timeline({
          placementId: args.placementId,
          premisesId: args.premisesId,
        }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.timeline,
      },
    }),

  verifySpaceBookingDepartureCreate: async (placement: Cas1SpaceBooking) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.premises.placements.departure({ premisesId: placement.premises.id, placementId: placement.id }),
      })
    ).body.requests,
}
