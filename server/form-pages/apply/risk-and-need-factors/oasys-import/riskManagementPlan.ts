import type { DataServices, OasysPage, PersonRisksUI } from '@approved-premises/ui'

import type { ApprovedPremisesApplication, ArrayOfOASysRiskManagementQuestions } from '@approved-premises/api'

import { Page } from '../../../utils/decorators'
import { getOasysSections, oasysImportReponse, validateOasysEntries } from '../../../../utils/oasysImportUtils'

type RiskManagementBody = {
  riskManagementAnswers: Record<string, string>
  riskManagementSummaries: ArrayOfOASysRiskManagementQuestions
}

@Page({
  name: 'risk-management-plan',
  bodyProperties: ['riskManagementAnswers', 'riskManagementSummaries'],
})
export default class RiskManagementPlan implements OasysPage {
  title = 'Edit risk information'

  riskManagementSummaries: RiskManagementBody['riskManagementSummaries']

  riskManagementAnswers: RiskManagementBody['riskManagementAnswers']

  oasysCompleted: string

  risks: PersonRisksUI

  oasysSuccess: boolean

  static sectionName = 'riskManagement'

  constructor(public body: Partial<RiskManagementBody>) {}

  static async initialize(
    body: Record<string, unknown>,
    application: ApprovedPremisesApplication,
    token: string,
    dataServices: DataServices,
  ) {
    return getOasysSections(body, application, token, dataServices, RiskManagementPlan, {
      sectionName: 'riskManagementPlan',
      summaryKey: 'riskManagementSummaries',
      answerKey: 'riskManagementAnswers',
    })
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
    return validateOasysEntries<RiskManagementBody>(this.body, 'riskManagementSummaries', 'riskManagementAnswers')
  }
}
