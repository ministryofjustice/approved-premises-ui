import type {
  ActiveOffence,
  ApprovedPremisesApplication as Application,
  ApprovedPremisesApplicationSummary as ApplicationSummary,
  ApprovedPremisesAssessment as Assessment,
  Document,
  NewWithdrawal,
  SubmitApprovedPremisesApplication,
  TimelineEvent,
  UpdateApprovedPremisesApplication,
} from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class ApplicationClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('applicationClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async find(applicationId: string): Promise<Application> {
    return (await this.restClient.get({
      path: paths.applications.show({ id: applicationId }),
    })) as Application
  }

  async create(crn: string, activeOffence: ActiveOffence): Promise<Application> {
    const { convictionId, deliusEventNumber, offenceId } = activeOffence

    return (await this.restClient.post({
      path: `${paths.applications.new.pattern}?createWithRisks=${!config.flags.oasysDisabled}`,
      data: { crn, convictionId, deliusEventNumber, offenceId, type: 'CAS1' },
    })) as Application
  }

  async update(applicationId: string, updateData: UpdateApprovedPremisesApplication): Promise<Application> {
    return (await this.restClient.put({
      path: paths.applications.update({ id: applicationId }),
      data: { ...updateData, type: 'CAS1' },
    })) as Application
  }

  async all(): Promise<Array<ApplicationSummary>> {
    return (await this.restClient.get({
      path: paths.applications.index.pattern,
    })) as Array<ApplicationSummary>
  }

  async submit(applicationId: string, submissionData: SubmitApprovedPremisesApplication): Promise<void> {
    await this.restClient.post({
      path: paths.applications.submission({ id: applicationId }),
      data: { ...submissionData, type: 'CAS1' },
    })
  }

  async documents(application: Application): Promise<Array<Document>> {
    return (await this.restClient.get({
      path: paths.applications.documents({ id: application.id }),
    })) as Array<Document>
  }

  async assessment(applicationId: string): Promise<Assessment> {
    return (await this.restClient.get({
      path: paths.applications.assessment({ id: applicationId }),
    })) as Assessment
  }

  async withdrawal(applicationId: string, body: NewWithdrawal): Promise<void> {
    await this.restClient.post({
      path: paths.applications.withdrawal({ id: applicationId }),
      data: body,
    })
  }

  async timeline(applicationId: string): Promise<Array<TimelineEvent>> {
    return (await this.restClient.get({
      path: paths.applications.timeline({ id: applicationId }),
    })) as Array<TimelineEvent>
  }
}
