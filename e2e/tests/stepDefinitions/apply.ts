import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'

import ApplyHelper from '../../../cypress_shared/helpers/apply'

import { applicationFactory, personFactory } from '../../../server/testutils/factories'

import personData from '../../../cypress_shared/fixtures/person.json'
import applicationData from '../../../cypress_shared/fixtures/applicationData.json'
import { updateApplicationReleaseDate } from '../../../cypress_shared/helpers/index'

const person = personFactory.build(personData)
const application = applicationFactory.build({ person, data: updateApplicationReleaseDate(applicationData) })

Given('I start a new application', () => {
  const apply = new ApplyHelper(application, person, [], 'e2e')
  apply.startApplication()
})

Given('I fill in and complete an application', () => {
  cy.url().then(url => {
    const id = url.match(/applications\/(.+)\/tasks/)[1]
    application.id = id

    const apply = new ApplyHelper(application, person, [], 'e2e')
    apply.initializeE2e()

    apply.completeApplication(true)
  })
})

Then('I should see a confirmation screen', () => {
  // TODO: add expectations when we have enough information to submit an application
  // // And I should be taken to the confirmation page
  // const confirmationPage = new SubmissionConfirmation()
  // // When I click 'Back to dashboard'
  // confirmationPage.clickBackToDashboard()
  // // Then I am taken back to the dashboard
  // Page.verifyOnPage(ListPage)
})
