import { stubFor, guidRegex } from './index'
import nonArrivalFactory from '../server/testutils/factories/nonArrival'
import { getCombinations, errorStub } from './utils'

const nonArrivalStubs = [
  async () =>
    stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/non-arrivals`,
        bodyPatterns: [
          {
            matchesJsonPath: "$.[?(@.date != '')]",
          },
          {
            matchesJsonPath: "$.[?(@.reason != '')]",
          },
        ],
      },
      response: {
        status: 201,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: JSON.stringify(nonArrivalFactory.build()),
      },
    }),
]

const requiredFields = getCombinations(['date', 'reason'])

requiredFields.forEach((fields: Array<string>) => {
  nonArrivalStubs.push(async () =>
    stubFor(errorStub(fields, `/premises/${guidRegex}/bookings/${guidRegex}/non-arrivals`, ['reason'])),
  )
})

export default nonArrivalStubs
