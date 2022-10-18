import type { NewPremises } from 'approved-premises'
import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class PremisesNewPage extends Page {
  constructor() {
    super('Add a new property')
  }

  static visit(): PremisesNewPage {
    cy.visit(paths.premises.new({}))
    return new PremisesNewPage()
  }

  completeForm(newPremises: NewPremises): void {
    this.getLabel('Property name (optional)')
    this.getTextInputByIdAndEnterDetails('name', newPremises.name)

    this.getLabel('Postcode')
    this.getTextInputByIdAndEnterDetails('postcode', newPremises.postcode)

    this.clickSubmit()
  }
}
