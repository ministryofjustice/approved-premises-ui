import { userFactory } from '../../../server/testutils/factories'
import ListPage from '../../pages/admin/userManagement/listPage'

context('User management', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()
  })

  it('allows the user to view users', () => {
    // Given there are users in the DB
    const users = userFactory.buildList(10)
    cy.task('stubUsers', { users })

    // When I visit the list page
    const page = ListPage.visit()
    page.checkForBackButton('/')

    // Then I should see the users and their details
    page.shouldShowUsers(users)
  })
})
