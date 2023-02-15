import type { DataServices, OASysSectionUIArray, PersonRisksUI } from '@approved-premises/ui'

import type { ApprovedPremisesApplication, OASysSections } from '@approved-premises/api'

import TasklistPage from '../../../tasklistPage'

import { Page } from '../../../utils/decorators'
import { oasysImportReponse, sortOasysImportSummaries } from '../../../../utils/oasysImportUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'

type RiskManagementBody = {
  riskManagementAnswers: Array<string> | Record<string, string> | null
  riskManagementSummaries: OASysSectionUIArray
}

@Page({
  name: 'risk-management-plan',
  bodyProperties: ['riskManagementAnswers', 'riskManagementSummaries'],
})
export default class RiskManagementPlan implements TasklistPage {
  title = 'Edit risk information'

  riskManagementSummaries: RiskManagementBody['riskManagementSummaries']

  riskManagementAnswers: RiskManagementBody['riskManagementAnswers']

  oasysCompleted: string

  risks: PersonRisksUI

  constructor(public body: Partial<RiskManagementBody>) {}

  static async initialize(
    body: Record<string, unknown>,
    application: ApprovedPremisesApplication,
    token: string,
    dataServices: DataServices,
  ) {
    const oasysSections: OASysSections = await dataServices.personService.getOasysSections(
      token,
      application.person.crn,
    )

    const riskManagement = sortOasysImportSummaries(oasysSections.riskManagementPlan)

    body.riskManagementSummaries = riskManagement

    const page = new RiskManagementPlan(body)
    page.riskManagementSummaries = riskManagement as OASysSectionUIArray
    page.oasysCompleted = oasysSections?.dateCompleted || oasysSections?.dateStarted
    page.risks = mapApiPersonRisksForUi(application.risks)

    return page
  }

  previous() {
    return 'supporting-information'
  }

  next() {
    return 'risk-to-self'
  }

  response() {
    return oasysImportReponse(this.body.riskManagementAnswers, this.body.riskManagementSummaries)
  }

  errors() {
    return {}
  }
}
