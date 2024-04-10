import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

export default class SufficientInformationPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Suitability Assessment', assessment, 'sufficient-information', 'sufficient-information', '', {
      'allow-sufficient-information-request-without-confirmation': true,
    })
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('sufficientInformation')
  }

  addNote() {
    this.completeTextInputFromPageBody('query')
  }
}
