import type { Request } from 'express'
import type { DataServices, GroupedApplications, PaginatedResponse } from '@approved-premises/ui'
import type {
  ApplicationSortField,
  ApprovedPremisesApplication,
  ApprovedPremisesApplicationSummary,
  ApprovedPremisesAssessment as Assessment,
  Document,
  NewWithdrawal,
  SortDirection,
} from '@approved-premises/api'

import { updateFormArtifactData } from '../form-pages/utils/updateFormArtifactData'
import { getApplicationSubmissionData, getApplicationUpdateData } from '../utils/applications/getApplicationData'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import type { ApplicationClient, RestClientBuilder } from '../data'
import { ValidationError } from '../utils/errors'

import { getBody } from '../form-pages/utils'
import Review from '../form-pages/apply/check-your-answers/review'

export default class ApplicationService {
  constructor(private readonly applicationClientFactory: RestClientBuilder<ApplicationClient>) {}

  async createApplication(
    token: string,
    crn: string,
    convictionId: number,
    deliusEventNumber: string,
  ): Promise<ApprovedPremisesApplication> {
    const applicationClient = this.applicationClientFactory(token)

    const application = await applicationClient.create(crn, convictionId, deliusEventNumber)

    return application
  }

  async findApplication(token: string, id: string): Promise<ApprovedPremisesApplication> {
    const applicationClient = this.applicationClientFactory(token)

    const application = await applicationClient.find(id)

    return application
  }

  async dashboard(
    token: string,
    page: number = 1,
    sortBy: ApplicationSortField = 'createdAt',
    sortDirection: SortDirection = 'asc',
  ): Promise<PaginatedResponse<ApprovedPremisesApplicationSummary>> {
    const applicationClient = this.applicationClientFactory(token)

    return applicationClient.dashboard(page, sortBy, sortDirection)
  }

  async getAllForLoggedInUser(token: string): Promise<GroupedApplications> {
    const applicationClient = this.applicationClientFactory(token)
    const allApplications = await applicationClient.all()
    const result = {
      inProgress: [],
      requestedFurtherInformation: [],
      submitted: [],
    } as GroupedApplications

    await Promise.all(
      allApplications.map(async application => {
        switch (application.status) {
          case 'inProgress':
            result.inProgress.push(application)
            break
          case 'requestedFurtherInformation':
            result.requestedFurtherInformation.push(application)
            break
          default:
            result.submitted.push(application)
            break
        }
      }),
    )

    return result
  }

  async getDocuments(token: string, application: ApprovedPremisesApplication): Promise<Array<Document>> {
    const applicationClient = this.applicationClientFactory(token)

    const documents = await applicationClient.documents(application)

    return documents
  }

  async initializePage(
    Page: TasklistPageInterface,
    request: Request,
    dataServices: DataServices,
    userInput?: Record<string, unknown>,
  ): Promise<TasklistPage> {
    const application = await this.findApplication(request.user.token, request.params.id)
    const body = getBody(Page, application, request, userInput)

    const page = Page.initialize
      ? await Page.initialize(body, application, request.user.token, dataServices)
      : new Page(body, application)

    return page
  }

  async save(page: TasklistPage, request: Request) {
    const errors = page.errors()

    if (Object.keys(errors).length) {
      throw new ValidationError<typeof page>(errors)
    } else {
      const application = await this.findApplication(request.user.token, request.params.id)
      const updatedApplication = updateFormArtifactData(page, application, Review)

      const client = this.applicationClientFactory(request.user.token)

      await client.update(application.id, getApplicationUpdateData(updatedApplication))
    }
  }

  async submit(token: string, application: ApprovedPremisesApplication) {
    const client = this.applicationClientFactory(token)

    await client.submit(application.id, getApplicationSubmissionData(application))
  }

  async getApplicationFromSessionOrAPI(request: Request): Promise<ApprovedPremisesApplication> {
    const { application } = request.session

    if (application && application.id === request.params.id) {
      return application
    }
    return this.findApplication(request.user.token, request.params.id)
  }

  async getAssessment(token: string, assessmentId: string): Promise<Assessment> {
    const client = this.applicationClientFactory(token)
    const assessment = await client.assessment(assessmentId)

    return assessment
  }

  async withdraw(token: string, applicationId: string, body: NewWithdrawal) {
    const client = this.applicationClientFactory(token)

    await client.withdrawal(applicationId, body)
  }

  async timeline(token: string, applicationId: string) {
    const client = this.applicationClientFactory(token)

    const timeline = await client.timeline(applicationId)

    return timeline
  }

  async getPlacementApplications(token: string, applicationId: string) {
    const client = this.applicationClientFactory(token)

    const placementApplications = await client.placementApplications(applicationId)

    return placementApplications
  }
}
