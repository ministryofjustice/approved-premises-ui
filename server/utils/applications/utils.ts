import type {
  ApplicationType,
  FormArtifact,
  FormPages,
  FormSections,
  JourneyType,
  PageResponse,
  TableRow,
  UiTimelineEvent,
} from '@approved-premises/ui'
import type {
  ApprovedPremisesApplication as Application,
  ApplicationStatus,
  ApprovedPremisesApplicationSummary as ApplicationSummary,
  Person,
  TimelineEvent,
  TimelineEventType,
} from '@approved-premises/api'
import MaleAp from '../../form-pages/apply/reasons-for-placement/basic-information/maleAp'
import IsExceptionalCase from '../../form-pages/apply/reasons-for-placement/basic-information/isExceptionalCase'
import paths from '../../paths/apply'
import Apply from '../../form-pages/apply'
import { isApplicableTier, isFullPerson, tierBadge } from '../personUtils'
import { DateFormats } from '../dateUtils'
import Assess from '../../form-pages/assess'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../retrieveQuestionResponseFromFormArtifact'
import ExceptionDetails from '../../form-pages/apply/reasons-for-placement/basic-information/exceptionDetails'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import PlacementRequest from '../../form-pages/placement-application'
import isAssessment from '../assessments/isAssessment'
import getAssessmentSections from '../assessments/getSections'
import { RestrictedPersonError } from '../errors'

const dashboardTableRows = (applications: Array<ApplicationSummary>): Array<TableRow> => {
  return applications.map(application => {
    const tier = application.risks?.tier?.value?.level

    return [
      createNameAnchorElement(application.person, application.id),
      textValue(application.person.crn),
      htmlValue(tier == null ? '' : tierBadge(tier)),
      textValue(
        application.arrivalDate ? DateFormats.isoDateToUIDate(application.arrivalDate, { format: 'short' }) : 'N/A',
      ),
      htmlValue(getStatus(application)),
      createWithdrawElement(application.id, application),
    ]
  })
}

const statusTags: Record<ApplicationStatus, string> = {
  inProgress: `<strong class="govuk-tag govuk-tag--blue">In Progress</strong>`,
  requestedFurtherInformation: `<strong class="govuk-tag govuk-tag--yellow">Info Request</strong>`,
  submitted: `<strong class="govuk-tag">Submitted</strong>`,
  pending: `<strong class="govuk-tag govuk-tag--blue">Pending</strong>`,
  rejected: `<strong class="govuk-tag govuk-tag--red">Rejected</strong>`,
  awaitingPlacement: `<strong class="govuk-tag govuk-tag--blue">Awaiting Placement</strong>`,
  placed: `<strong class="govuk-tag govuk-tag--pink">Placed</strong>`,
  inapplicable: `<strong class="govuk-tag govuk-tag--red">Inapplicable</strong>`,
  withdrawn: `<strong class="govuk-tag govuk-tag--red">Withdrawn</strong>`,
}

const getStatus = (application: ApplicationSummary): string => {
  return statusTags[application.status]
}

export const textValue = (value: string) => {
  return { text: value }
}

export const htmlValue = (value: string) => {
  return { html: value }
}

const createNameAnchorElement = (person: Person, applicationId: string) => {
  return isFullPerson(person)
    ? htmlValue(
        `<a href=${paths.applications.show({ id: applicationId })} data-cy-id="${applicationId}">${person.name}</a>`,
      )
    : textValue(`LAO CRN: ${person.crn}`)
}

export const createWithdrawElement = (applicationId: string, application: ApplicationSummary) => {
  if (!application?.submittedAt)
    return htmlValue(`<a href="${paths.applications.withdraw.new({ id: applicationId })}">Withdraw</a>`)

  return textValue('')
}

export type ApplicationOrAssessmentResponse = Record<string, Array<PageResponse>>

export const getSections = (formArtifact: FormArtifact): FormSections => {
  const journeyType = journeyTypeFromArtifact(formArtifact)

  switch (journeyType) {
    case 'applications':
      return Apply.sections.slice(0, -1)
    case 'assessments':
      if (!isAssessment(formArtifact)) throw new Error('Form artifact is not an assessment')
      return getAssessmentSections(formArtifact)
    case 'placement-applications':
      return PlacementRequest.sections
    default:
      throw new Error(`Unknown journey type: ${journeyType}`)
  }
}

export const journeyPages = (journeyType: JourneyType): FormPages => {
  switch (journeyType) {
    case 'applications':
      return Apply.pages
    case 'assessments':
      return Assess.pages
    case 'placement-applications':
      return PlacementRequest.pages
    default:
      throw new Error(`Unknown journey type: ${journeyType}`)
  }
}

const isInapplicable = (application: Application): boolean => {
  const isExceptionalCase = retrieveOptionalQuestionResponseFromApplicationOrAssessment(
    application,
    IsExceptionalCase,
    'isExceptionalCase',
  )

  const agreedCaseWithManager = retrieveOptionalQuestionResponseFromApplicationOrAssessment(
    application,
    ExceptionDetails,
    'agreedCaseWithManager',
  )

  const shouldPersonBePlacedInMaleAp = retrieveOptionalQuestionResponseFromApplicationOrAssessment(
    application,
    MaleAp,
    'shouldPersonBePlacedInMaleAp',
  )

  if (isExceptionalCase === 'no') {
    return true
  }

  if (isExceptionalCase === 'yes' && agreedCaseWithManager === 'no') {
    return true
  }

  if (shouldPersonBePlacedInMaleAp === 'no') {
    return true
  }

  return false
}

const firstPageOfApplicationJourney = (application: Application) => {
  if (!isFullPerson(application.person)) throw new RestrictedPersonError(application.person.crn)

  if (isApplicableTier(application.person.sex, application.risks?.tier?.value?.level)) {
    return paths.applications.pages.show({
      id: application.id,
      task: 'basic-information',
      page: 'confirm-your-details',
    })
  }

  return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' })
}

const getApplicationType = (application: Application): ApplicationType => {
  if (application.isPipeApplication) {
    return 'PIPE'
  }
  return 'Standard'
}

export const eventTypeTranslations: Record<TimelineEventType, string> = {
  approved_premises_application_submitted: 'Application submitted',
  approved_premises_application_assessed: 'Application assessed',
  approved_premises_booking_made: 'Booking made',
  approved_premises_person_arrived: 'Person arrived',
  approved_premises_person_not_arrived: 'Person not arrived',
  approved_premises_person_departed: 'Person departed',
  approved_premises_booking_not_made: 'Booking not made',
  approved_premises_booking_cancelled: 'Booking cancelled',
  approved_premises_booking_changed: 'Booking changed',
  approved_premises_application_withdrawn: 'Application withdrawn',
  approved_premises_information_request: 'Information request',
  cas3_person_arrived: 'CAS3 person arrived',
  cas3_person_departed: 'CAS3 person departed',
}

const mapTimelineEventsForUi = (timelineEvents: Array<TimelineEvent>): Array<UiTimelineEvent> => {
  return timelineEvents
    .sort((a, b) => Number(DateFormats.isoToDateObj(b.occurredAt)) - Number(DateFormats.isoToDateObj(a.occurredAt)))
    .map(timelineEvent => {
      return {
        label: { text: eventTypeTranslations[timelineEvent.type] },
        datetime: {
          timestamp: timelineEvent.occurredAt,
          date: DateFormats.isoDateTimeToUIDateTime(timelineEvent.occurredAt),
        },
      }
    })
}

export {
  dashboardTableRows,
  firstPageOfApplicationJourney,
  arrivalDateFromApplication,
  getApplicationType,
  getStatus,
  isInapplicable,
  mapTimelineEventsForUi,
  statusTags,
}
