import { ApplicationStatus } from '@approved-premises/api'
import { isAfter } from 'date-fns'
import { mockOptionalQuestionResponse } from '../../testutils/mockQuestionResponse'
import {
  applicationFactory,
  applicationSummaryFactory,
  assessmentFactory,
  personFactory,
  placementApplicationFactory,
  restrictedPersonFactory,
  tierEnvelopeFactory,
  timelineEventFactory,
} from '../../testutils/factories'
import paths from '../../paths/apply'
import Apply from '../../form-pages/apply'
import Assess from '../../form-pages/assess'
import PlacementRequest from '../../form-pages/placement-application'
import { DateFormats } from '../dateUtils'
import { isApplicableTier, isFullPerson, tierBadge } from '../personUtils'

import {
  createWithdrawElement,
  dashboardTableRows,
  eventTypeTranslations,
  firstPageOfApplicationJourney,
  getApplicationType,
  getSections,
  getStatus,
  isInapplicable,
  mapTimelineEventsForUi,
  statusTags,
  unwithdrawableApplicationStatuses,
} from './utils'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import { RestrictedPersonError } from '../errors'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('../journeyTypeFromArtifact')
const FirstApplyPage = jest.fn()
const SecondApplyPage = jest.fn()
const AssessPage = jest.fn()
const PlacementRequestPage = jest.fn()

jest.mock('../../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {}, 'type-of-ap': {} },
  }
})

jest.mock('../../form-pages/assess', () => {
  return {
    pages: { 'assess-page': {} },
  }
})

jest.mock('../personUtils')

const applySection1Task1 = {
  id: 'first-apply-section-task-1',
  title: 'First Apply section, task 1',
  actionText: '',
  pages: {
    first: FirstApplyPage,
    second: SecondApplyPage,
  },
}
const applySection1Task2 = {
  id: 'first-apply-section-task-2',
  title: 'First Apply section, task 2',
  actionText: '',
  pages: {},
}

const applySection2Task1 = {
  id: 'second-apply-section-task-1',
  title: 'Second Apply section, task 1',
  actionText: '',
  pages: {},
}

const applySection2Task2 = {
  id: 'second-apply-section-task-2',
  title: 'Second Apply section, task 2',
  actionText: '',
  pages: {},
}

const applySection1 = {
  name: 'first-apply-section',
  title: 'First Apply section',
  tasks: [applySection1Task1, applySection1Task2],
}

const applySection2 = {
  name: 'second-apply-section',
  title: 'Second Apply section',
  tasks: [applySection2Task1, applySection2Task2],
}

Apply.sections = [applySection1, applySection2]

Apply.pages['first-apply-section-task-1'] = {
  first: FirstApplyPage,
  second: SecondApplyPage,
}

const assessSection1Task1 = {
  id: 'first-assess-section-task-1',
  title: 'First Apply section, task 1',
  actionText: '',
  pages: {},
}
const assessSection1Task2 = {
  id: 'first-assess-section-task-2',
  title: 'First Assess section, task 2',
  actionText: '',
  pages: {},
}

const assessSection2Task1 = {
  id: 'second-assess-section-task-1',
  title: 'Second Assess section, task 1',
  actionText: '',
  pages: {},
}

const assessSection2Task2 = {
  id: 'second-assess-section-task-2',
  title: 'Second Assess section, task 2',
  actionText: '',
  pages: {},
}

const assessSection1 = {
  name: 'first-assess-section',
  title: 'First Assess section',
  tasks: [assessSection1Task1, assessSection1Task2],
}

const assessSection2 = {
  name: 'second-assess-section',
  title: 'Second Assess section',
  tasks: [assessSection2Task1, assessSection2Task2],
}

Assess.sections = [assessSection1, assessSection2]

Assess.pages['assess-page'] = {
  first: AssessPage,
}

PlacementRequest.pages['placement-request-page'] = {
  first: PlacementRequestPage,
}

describe('utils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  describe('dashboardTableRows', () => {
    it('returns an array of applications as table rows', async () => {
      ;(tierBadge as jest.Mock).mockReturnValue('TIER_BADGE')
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

      const arrivalDate = DateFormats.dateObjToIsoDate(new Date(2021, 0, 3))
      const person = personFactory.build({ name: 'A' })
      const applicationA = applicationSummaryFactory.build({
        arrivalDate: undefined,
        person,
        submittedAt: null,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: 'A1' } }) },
      })
      const applicationB = applicationSummaryFactory.build({
        arrivalDate,
        person,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: null } }) },
      })

      const result = dashboardTableRows([applicationA, applicationB])

      expect(tierBadge).toHaveBeenCalledWith('A1')

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationA.id })} data-cy-id="${applicationA.id}">${
              person.name
            }</a>`,
          },
          {
            text: applicationA.person.crn,
          },
          {
            html: 'TIER_BADGE',
          },
          {
            text: 'N/A',
          },
          {
            html: getStatus(applicationA),
          },
          createWithdrawElement(applicationA.id, applicationA),
        ],
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationB.id })} data-cy-id="${applicationB.id}">${
              person.name
            }</a>`,
          },
          {
            text: applicationB.person.crn,
          },
          {
            html: '',
          },
          {
            text: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }),
          },
          {
            html: getStatus(applicationB),
          },
          createWithdrawElement(applicationB.id, applicationB),
        ],
      ])
    })
  })

  describe('dashboardTableRows when tier is undefined', () => {
    it('returns a blank tier badge', async () => {
      ;(tierBadge as jest.Mock).mockClear()
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

      const arrivalDate = DateFormats.dateObjToIsoDate(new Date(2021, 0, 3))
      const person = personFactory.build({ name: 'My name' })
      const application = applicationSummaryFactory.build({
        arrivalDate,
        person,
        risks: { tier: undefined },
        status: 'inProgress',
      })

      const result = dashboardTableRows([application])

      expect(tierBadge).not.toHaveBeenCalled()

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: application.id })} data-cy-id="${application.id}">${
              person.name
            }</a>`,
          },
          {
            text: application.person.crn,
          },
          {
            html: '',
          },
          {
            text: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }),
          },
          {
            html: getStatus(application),
          },
          createWithdrawElement(application.id, application),
        ],
      ])
    })
  })

  describe('dashboardTableRows when risks is undefined', () => {
    it('returns a blank tier badge', async () => {
      ;(tierBadge as jest.Mock).mockClear()
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

      const arrivalDate = DateFormats.dateObjToIsoDate(new Date(2021, 0, 3))
      const person = personFactory.build({ name: 'My name' })

      const application = applicationSummaryFactory.build({
        arrivalDate,
        person,
        risks: undefined,
      })

      const result = dashboardTableRows([application])

      expect(tierBadge).not.toHaveBeenCalled()

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: application.id })} data-cy-id="${application.id}">${
              person.name
            }</a>`,
          },
          {
            text: application.person.crn,
          },
          {
            html: '',
          },
          {
            text: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }),
          },
          {
            html: getStatus(application),
          },
          createWithdrawElement(application.id, application),
        ],
      ])
    })
  })

  describe('getStatus', () => {
    const statuses = Object.keys(statusTags) as Array<ApplicationStatus>

    statuses.forEach(status => {
      it(`returns the correct tag for each an application with a status of ${status}`, () => {
        const application = applicationFactory.build({ status })
        expect(getStatus(application)).toEqual(statusTags[status])
      })
    })
  })

  describe('getSections', () => {
    it('returns Apply sections when given an application', () => {
      ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue('applications')

      const application = applicationFactory.build()
      const sections = getSections(application)

      expect(sections).toEqual(Apply.sections.slice(0, -1))
    })

    it('returns Assess sections when given an assessment', () => {
      ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue('assessments')

      const assessment = assessmentFactory.build()
      const sections = getSections(assessment)

      expect(sections).toEqual(Assess.sections)
    })

    it('returns PlacementApplication sections when given a placement application', () => {
      ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue(
        'placement-applications',
      )

      const placementApplication = placementApplicationFactory.build()

      const sections = getSections(placementApplication)

      expect(sections).toEqual(PlacementRequest.sections)
    })
  })

  describe('firstPageOfApplicationJourney', () => {
    it('returns the sentence type page for an applicable application', () => {
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)
      ;(isApplicableTier as jest.Mock).mockReturnValue(true)
      const application = applicationFactory.withFullPerson().build()

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'confirm-your-details' }),
      )
    })

    it('returns the is exceptional case page for an unapplicable application', () => {
      ;(isApplicableTier as jest.Mock).mockReturnValue(false)
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

      const application = applicationFactory.withFullPerson().build()

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' }),
      )
    })

    it('returns the "is exceptional case" page for an application for a person without a tier', () => {
      const application = applicationFactory.withFullPerson().build()
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

      application.risks = undefined

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' }),
      )
    })

    it('throws an error if the person is not a Full Person', () => {
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(false)

      const restrictedPerson = restrictedPersonFactory.build()
      const application = applicationFactory.build({ person: restrictedPerson })

      expect(() => firstPageOfApplicationJourney(application)).toThrowError(
        `CRN: ${restrictedPerson.crn} is restricted`,
      )
      expect(() => firstPageOfApplicationJourney(application)).toThrowError(RestrictedPersonError)
    })
  })

  describe('isInapplicable', () => {
    const application = applicationFactory.build()

    it('should return true if the applicant has answered no to the isExceptionalCase question', () => {
      mockOptionalQuestionResponse({ isExceptionalCase: 'no' })

      expect(isInapplicable(application)).toEqual(true)
    })

    it('should return false if the applicant has answered yes to the isExceptionalCase question', () => {
      mockOptionalQuestionResponse({ isExceptionalCase: 'yes' })

      expect(isInapplicable(application)).toEqual(false)
    })

    it('should return true if the applicant has answered yes to the isExceptionalCase question and no to the agreedCaseWithManager question', () => {
      mockOptionalQuestionResponse({ isExceptionalCase: 'yes', agreedCaseWithManager: 'no' })

      expect(isInapplicable(application)).toEqual(true)
    })

    it('should return false if the applicant has answered yes to the isExceptionalCase question and yes to the agreedCaseWithManager question', () => {
      mockOptionalQuestionResponse({ isExceptionalCase: 'yes', agreedCaseWithManager: 'yes' })

      expect(isInapplicable(application)).toEqual(false)
    })

    it('should return false if the applicant has not answered the isExceptionalCase question', () => {
      mockOptionalQuestionResponse({})

      expect(isInapplicable(application)).toEqual(false)
    })

    it('should return true if the applicant has answered no to the shouldPersonBePlacedInMaleAp question', () => {
      mockOptionalQuestionResponse({ shouldPersonBePlacedInMaleAp: 'no' })

      expect(isInapplicable(application)).toEqual(true)
    })

    it('should return false if the applicant has answered yes to the shouldPersonBePlacedInMaleAp question', () => {
      mockOptionalQuestionResponse({ shouldPersonBePlacedInMaleAp: 'yes' })

      expect(isInapplicable(application)).toEqual(false)
    })

    it('should return false if the applicant has not answered the isExceptionalCase question', () => {
      mockOptionalQuestionResponse({})

      expect(isInapplicable(application)).toEqual(false)
    })
  })

  describe('getApplicationType', () => {
    it('returns standard when the application is not PIPE', () => {
      const application = applicationFactory.build({
        isPipeApplication: false,
      })

      expect(getApplicationType(application)).toEqual('Standard')
    })

    it('returns PIPE when the application is PIPE', () => {
      const application = applicationFactory.build({
        isPipeApplication: true,
      })

      expect(getApplicationType(application)).toEqual('PIPE')
    })
  })

  describe('createWithdrawElement', () => {
    const withdrawalableApplicationStatues: Array<ApplicationStatus> = [
      'awaitingPlacement',
      'inProgress',
      'pending',
      'requestedFurtherInformation',
      'submitted',
    ]

    it.each(withdrawalableApplicationStatues)(
      'returns a link to withdraw the application if the application status is %s',
      status => {
        const applicationSummary = applicationSummaryFactory.build({ status })
        expect(createWithdrawElement('id', applicationSummary)).toEqual({
          html: '<a href="/applications/id/withdrawals/new">Withdraw</a>',
        })
      },
    )

    it.each(unwithdrawableApplicationStatuses)('returns an empty string if the application status is %s', status => {
      const applicationSummary = applicationSummaryFactory.build({ status })

      expect(createWithdrawElement('id', applicationSummary)).toEqual({
        text: '',
      })
    })
  })

  describe('mapTimelineEventsForUi', () => {
    it('maps the events into the format required by the MoJ UI Timeline component', () => {
      const timelineEvents = timelineEventFactory.buildList(1)
      expect(mapTimelineEventsForUi(timelineEvents)).toEqual([
        {
          datetime: {
            timestamp: timelineEvents[0].occurredAt,
            date: DateFormats.isoDateTimeToUIDateTime(timelineEvents[0].occurredAt),
          },
          label: {
            text: eventTypeTranslations[timelineEvents[0].type],
          },
        },
      ])
    })

    it('sorts the events in ascending order', () => {
      const timelineEvents = timelineEventFactory.buildList(3)

      const actual = mapTimelineEventsForUi(timelineEvents)

      expect(
        isAfter(
          DateFormats.isoToDateObj(actual[0].datetime.timestamp),
          DateFormats.isoToDateObj(actual[1].datetime.timestamp),
        ),
      ).toEqual(true)

      expect(
        isAfter(
          DateFormats.isoToDateObj(actual[0].datetime.timestamp),
          DateFormats.isoToDateObj(actual[2].datetime.timestamp),
        ),
      ).toEqual(true)

      expect(
        isAfter(
          DateFormats.isoToDateObj(actual[1].datetime.timestamp),
          DateFormats.isoToDateObj(actual[2].datetime.timestamp),
        ),
      ).toEqual(true)
    })
  })
})
