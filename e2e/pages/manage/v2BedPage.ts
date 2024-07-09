import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class V2BedPage extends BasePage {
  static async initialize(page: Page, premisesName: string) {
    await expect(page.locator('h1')).toContainText('Bed ')
    await expect(page.locator('.moj-identity-bar__title')).toContainText(premisesName)
    return new V2BedPage(page)
  }

  async clickActions() {
    await this.page.getByRole('button', { name: 'Actions' }).click()
  }

  async clickMarkBedAsOutOfService() {
    await this.clickActions()
    await this.page.getByRole('menuitem', { name: 'Create out of service bed record' }).click()
  }

  async showsOutOfServiceBedRecordedSuccessMessage() {
    await expect(this.page.locator('.govuk-notification-banner')).toContainText(
      'The out of service bed has been recorded',
    )
  }
}
