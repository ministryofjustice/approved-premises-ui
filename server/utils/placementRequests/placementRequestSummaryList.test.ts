import { Application } from '@approved-premises/api'
import { SummaryListItem } from '@approved-premises/ui'
import { applicationFactory, placementRequestDetailFactory } from '../../testutils/factories'
import offlineApplicationFactory from '../../testutils/factories/offlineApplication'
import { placementRequestSummaryList } from './placementRequestSummaryList'
import { DateFormats } from '../dateUtils'
import { apTypeLabels } from '../apTypeLabels'

describe('placementRequestSummaryList', () => {
  const application = applicationFactory.build({
    licenceExpiryDate: '2030-11-23',
  })
  const placementRequest = placementRequestDetailFactory.build({
    releaseType: 'hdc',
    expectedArrival: '2025-10-02',
    duration: 52,
    essentialCriteria: ['hasTactileFlooring'],
    application,
    notes: 'Test notes',
  })

  it('should generate the expected summary list', () => {
    expect(placementRequestSummaryList(placementRequest).rows).toEqual(
      expectedSummaryListItems(
        false,
        placementRequest.application.id,
        application.licenceExpiryDate,
        placementRequest.location,
      ),
    )
  })

  it('should generate the expected summary list when is withdrawn', () => {
    const isWithdrawn = true
    const withdrawnPlacementRequest = {
      ...placementRequest,
      isWithdrawn,
    }
    expect(placementRequestSummaryList(withdrawnPlacementRequest).rows).toEqual(
      expectedSummaryListItems(
        isWithdrawn,
        placementRequest.application.id,
        application.licenceExpiryDate,
        placementRequest.location,
      ),
    )
  })

  it(`should generate the expected summary list when placement-request's application is undefined`, () => {
    const undefinedApplication: Application = undefined
    const placementRequestWithoutLicenceExpiry = {
      ...placementRequest,
      application: undefinedApplication,
    }
    expect(placementRequestSummaryList(placementRequestWithoutLicenceExpiry).rows).toEqual(
      expectedSummaryListItems(false, undefined, '', placementRequest.location),
    )
  })

  it(`should generate the expected summary list when placement-request's application is not of type ApprovedPremisesApplication`, () => {
    const placementRequestWithOfflineApplication = {
      ...placementRequest,
      application: offlineApplicationFactory.build(),
    }
    expect(placementRequestSummaryList(placementRequestWithOfflineApplication).rows).toEqual(
      expectedSummaryListItems(
        false,
        placementRequestWithOfflineApplication.application.id,
        '',
        placementRequest.location,
      ),
    )
  })

  it(`should generate the expected summary list with blank licence expiry date when applications license-expiry date is not set`, () => {
    const placementRequestWithoutLicenceExpiry = {
      ...placementRequest,
      application: applicationFactory.build({
        licenceExpiryDate: undefined,
      }),
    }
    expect(placementRequestSummaryList(placementRequestWithoutLicenceExpiry).rows).toEqual(
      expectedSummaryListItems(
        false,
        placementRequestWithoutLicenceExpiry.application.id,
        '',
        placementRequest.location,
      ),
    )
  })

  const expectedSummaryListItems = (
    isWithdrawn: boolean,
    applicationId: string,
    expectedLicenceExpiryDate: string,
    expectedPostcode: string,
  ): Array<SummaryListItem> => {
    const apTypeListItem = generateApTypeListItem(applicationId)
    const rows = [
      {
        key: {
          text: 'Requested arrival date',
        },
        value: {
          text: 'Thu 2 Oct 2025',
        },
      },
      {
        key: {
          text: 'Expected departure date',
        },
        value: {
          text: 'Sun 23 Nov 2025',
        },
      },
      {
        key: {
          text: 'Length of stay',
        },
        value: {
          text: '7 weeks, 3 days',
        },
      },
      {
        key: {
          text: 'Release type',
        },
        value: {
          text: 'Home detention curfew (HDC)',
        },
      },
      {
        key: {
          text: 'Licence expiry date',
        },
        value: {
          text: expectedLicenceExpiryDate ? DateFormats.isoDateToUIDate(expectedLicenceExpiryDate) : '',
        },
      },
      apTypeListItem,
      {
        key: {
          text: 'Preferred postcode',
        },
        value: {
          text: expectedPostcode,
        },
      },
      {
        key: {
          text: 'Essential Criteria',
        },
        value: {
          html: '<ul class="govuk-list"><li>Tactile flooring</li></ul>',
        },
      },
      {
        key: {
          text: 'Desirable Criteria',
        },
        value: {
          html: '<ul class="govuk-list"></ul>',
        },
      },
      {
        key: {
          text: 'Observations from assessor',
        },
        value: {
          text: 'Test notes',
        },
      },
    ]
    if (isWithdrawn) {
      const statusRow = {
        key: {
          text: 'Status',
        },
        value: {
          html: `<strong class="govuk-tag govuk-tag--timeline-tag govuk-tag--red">
        Withdrawn
      </strong>`,
        },
      }
      rows.splice(7, 0, statusRow)
    }
    return rows
  }

  const generateApTypeListItem = (applicationId: string) => {
    const apTypeListItem = {
      key: {
        text: 'Type of AP',
      },
      value: {
        text: apTypeLabels[placementRequest.type],
      },
    }
    if (applicationId) {
      return {
        ...apTypeListItem,
        actions: {
          items: [
            {
              href: `/applications/${applicationId}?tab=timeline`,
              text: 'View timeline',
            },
          ],
        },
      }
    }
    return apTypeListItem
  }
})
