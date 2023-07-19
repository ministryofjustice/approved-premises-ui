import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'
import { nameOrPlaceholderCopy } from '../../../server/utils/personUtils'

export default class CateringPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Catering requirements',
      application,
      'further-considerations',
      'catering',
      paths.applications.pages.show({ id: application.id, task: 'further-considerations', page: 'rfap-details' }),
    )
    cy.get('.govuk-form-group').contains(
      `Can ${nameOrPlaceholderCopy(application.person)} be placed in a self-catered Approved Premises (AP)?`,
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('catering')
    this.completeTextInputFromPageBody('cateringDetail')
  }
}
