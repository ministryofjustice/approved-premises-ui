import type { DataServices, OasysPage, PersonRisksUI } from '@approved-premises/ui'

import type { ApprovedPremisesApplication, ArrayOfOASysRiskToSelfQuestions } from '@approved-premises/api'

import { Page } from '../../../utils/decorators'
import { getOasysSections, oasysImportReponse, validateOasysEntries } from '../../../../utils/oasysImportUtils'

type RiskToSelfBody = {
  riskToSelfAnswers: Record<string, string>
  riskToSelfSummaries: ArrayOfOASysRiskToSelfQuestions
}

@Page({
  name: 'risk-to-self',
  bodyProperties: ['riskToSelfAnswers', 'riskToSelfSummaries'],
})
export default class RiskToSelf implements OasysPage {
  title = 'Edit risk information'

  riskToSelfSummaries: RiskToSelfBody['riskToSelfSummaries']

  riskToSelfAnswers: RiskToSelfBody['riskToSelfAnswers']

  oasysCompleted: string

  risks: PersonRisksUI

  oasysSuccess: boolean

  constructor(public body: Partial<RiskToSelfBody>) {}

  static async initialize(
    body: Record<string, unknown>,
    application: ApprovedPremisesApplication,
    token: string,
    dataServices: DataServices,
  ) {
    return getOasysSections(body, application, token, dataServices, RiskToSelf, {
      sectionName: 'riskToSelf',
      summaryKey: 'riskToSelfSummaries',
      answerKey: 'riskToSelfAnswers',
    })
  }

  previous() {
    return 'risk-management-plan'
  }

  next() {
    return ''
  }

  response() {
    return oasysImportReponse(this.body.riskToSelfAnswers, this.body.riskToSelfSummaries)
  }

  errors() {
    return validateOasysEntries<RiskToSelfBody>(this.body, 'riskToSelfSummaries', 'riskToSelfAnswers')
  }
}
