/* eslint-disable no-console */
import { DeepPartial } from 'fishery'

import type { Premises } from 'approved-premises'
import { bulkStub } from './index'

import premisesJson from './stubs/premises.json'
import bookingFactory from '../server/testutils/factories/booking'
import premisesFactory from '../server/testutils/factories/premises'

import bookingStubs from './bookingStubs'
import boookingExtensionStubs from './bookingExtensionStubs'
import arrivalStubs from './arrivalStubs'
import nonArrivalStubs from './nonArrivalStubs'
import departureStubs from './departuresStubs'
import cancellationStubs from './cancellationStubs'
import lostBedStubs from './lostBedStubs'
import personStubs from './personStubs'
import applicationStubs from './applicationStubs'

import * as referenceDataStubs from './referenceDataStubs'
import premisesCapacityItemFactory from '../server/testutils/factories/premisesCapacityItem'
import staffMemberFactory from '../server/testutils/factories/staffMember'

const stubs = []

const premises = premisesJson.map(item => premisesFactory.build(item as DeepPartial<Premises>))

stubs.push({
  request: {
    method: 'GET',
    url: '/premises',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: premises,
  },
})

stubs.push({
  request: {
    method: 'POST',
    url: '/premises',
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: premisesFactory.build(),
  },
})

premises.forEach(item => {
  stubs.push({
    request: {
      method: 'GET',
      url: `/premises/${item.id}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: item,
    },
  })

  stubs.push({
    request: {
      method: 'GET',
      url: `/premises/${item.id}/capacity`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: premisesCapacityItemFactory.buildList(5),
    },
  })

  stubs.push({
    request: {
      method: 'GET',
      url: `/premises/${item.id}/staff`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: staffMemberFactory.buildList(10),
    },
  })

  const rand = () => Math.floor(Math.random() * 10)

  const bookings = [
    bookingFactory.arrivingToday().buildList(rand()),
    bookingFactory.arrivedToday().buildList(rand()),
    bookingFactory.departingToday().buildList(rand()),
    bookingFactory.departedToday().buildList(rand()),
    bookingFactory.arrivingSoon().buildList(rand()),
    bookingFactory.cancelledWithFutureArrivalDate().buildList(rand()),
    bookingFactory.departingSoon().buildList(rand()),
  ].flat()

  stubs.push({
    request: {
      method: 'GET',
      url: `/premises/${item.id}/bookings`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: bookings,
    },
  })

  bookings.forEach(booking => {
    stubs.push({
      request: {
        method: 'GET',
        url: `/premises/${item.id}/bookings/${booking.id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: booking,
      },
    })
  })
})

stubs.push(
  ...bookingStubs,
  ...arrivalStubs,
  ...nonArrivalStubs,
  ...departureStubs,
  ...cancellationStubs,
  ...boookingExtensionStubs,
  ...lostBedStubs,
  ...personStubs,
  ...applicationStubs,
  ...Object.values(referenceDataStubs),
)

console.log('Stubbing APIs')

bulkStub({
  mappings: stubs,
  importOptions: {
    duplicatePolicy: 'IGNORE',
    deleteAllNotInImport: true,
  },
}).then(_response => {
  console.log('Done!')
  process.exit(0)
})
