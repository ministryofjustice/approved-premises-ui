Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.task('stubPremises', [])
  cy.request('/')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})
