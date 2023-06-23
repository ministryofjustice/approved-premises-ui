import type {
  ApplicationType,
  FormArtifact,
  FormPages,
  FormSections,
  JourneyType,
  PageResponse,
  TableRow,
} from '@approved-premises/ui'
import type {
  ApprovedPremisesApplication as Application,
  ApplicationStatus,
  ApprovedPremisesApplicationSummary as ApplicationSummary,
} from '@approved-premises/api'
import MaleAp from '../../form-pages/apply/reasons-for-placement/basic-information/maleAp'
import IsExceptionalCase from '../../form-pages/apply/reasons-for-placement/basic-information/isExceptionalCase'
import paths from '../../paths/apply'
import Apply from '../../form-pages/apply'
import { UnknownPageError } from '../errors'
import { isApplicableTier, tierBadge } from '../personUtils'
import { DateFormats } from '../dateUtils'
import { TasklistPageInterface } from '../../form-pages/tasklistPage'
import Assess from '../../form-pages/assess'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../retrieveQuestionResponseFromFormArtifact'
import ExceptionDetails from '../../form-pages/apply/reasons-for-placement/basic-information/exceptionDetails'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import PlacementRequest from '../../form-pages/placement-application'
import isAssessment from '../assessments/isAssessment'
import getAssessmentSections from '../assessments/getSections'

const dashboardTableRows = (applications: Array<ApplicationSummary>): Array<TableRow> => {
  return applications.map(application => {
    const tier = application.risks?.tier?.value?.level

    return [
      createNameAnchorElement(application.person.name, application.id),
      textValue(application.person.crn),
      htmlValue(tier == null ? '' : tierBadge(tier)),
      textValue(
        application.arrivalDate ? DateFormats.isoDateToUIDate(application.arrivalDate, { format: 'short' }) : 'N/A',
      ),
      htmlValue(getStatus(application)),
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
}

const getStatus = (application: ApplicationSummary): string => {
  return statusTags[application.status]
}

const textValue = (value: string) => {
  return { text: value }
}

const htmlValue = (value: string) => {
  return { html: value }
}

const createNameAnchorElement = (name: string, applicationId: string) => {
  return htmlValue(
    `<a href=${paths.applications.show({ id: applicationId })} data-cy-id="${applicationId}">${name}</a>`,
  )
}

export type ApplicationOrAssessmentResponse = Record<string, Array<PageResponse>>

const getResponses = (formArtifact: FormArtifact): ApplicationOrAssessmentResponse => {
  const responses = {}

  Object.keys(formArtifact.data).forEach(taskName => {
    responses[taskName] = getResponsesForTask(formArtifact, taskName)
  })

  return responses
}

const getResponsesForTask = (formArtifact: FormArtifact, taskName: string): Array<PageResponse> => {
  const pageNames = Object.keys(formArtifact.data[taskName])
  const responsesForPages = pageNames.map(pageName => getResponseForPage(formArtifact, taskName, pageName))
  return responsesForPages
export const getSections = (formArtifact: FormArtifact): FormSections => {
  const journeyType = journeyTypeFromArtifact(formArtifact)

  switch (journeyType) {
    case 'applications':
      return Apply.sections.slice(0, -1)
    case 'assessments':
      if (!isAssessment(formArtifact)) throw new Error('Form artifact is not an assessment')
      return getAssessmentSections(formArtifact)
    case 'placement-applications':
      return PlacementRequest.sections.slice(0, -1)
    default:
      throw new Error(`Unknown journey type: ${journeyType}`)
  }
}

const getResponseForPage = (formArtifact: FormArtifact, taskName: string, pageName: string): PageResponse => {
  const Page = getPage(taskName, pageName, journeyTypeFromArtifact(formArtifact))

  const body = formArtifact?.data?.[taskName]?.[pageName]
  const page = new Page(body, formArtifact)

  return page.response()
}

const getPage = (taskName: string, pageName: string, journeyType: JourneyType): TasklistPageInterface => {
  const pageList = journeyPages(journeyType)[taskName]

  const Page = pageList[pageName]

  if (!Page) {
    throw new UnknownPageError(pageName)
  }

  return Page as TasklistPageInterface
}

const journeyPages = (journeyType: JourneyType): FormPages => {
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
  if (isApplicableTier(application.person.sex, application.risks?.tier?.value?.level)) {
    return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'transgender' })
  }

  return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' })
}

const getApplicationType = (application: Application): ApplicationType => {
  if (application.isPipeApplication) {
    return 'PIPE'
  }
  return 'Standard'
}

export {
  dashboardTableRows,
  firstPageOfApplicationJourney,
  arrivalDateFromApplication,
  getApplicationType,
  getPage,
  getResponseForPage,
  getResponses,
  getStatus,
  isInapplicable,
  statusTags,
}
