import { applicationFactory, personFactory } from '../../testutils/factories'
import { applicationIdentityBar, applicationMenuItems, applicationTitle } from './applicationIdentityBar'
import paths from '../../paths/apply'

describe('applicationIdentityBar', () => {
  describe('applicationTitle', () => {
    it('should return the title of the application', () => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person })

      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <span class="govuk-caption-l">heading</span>
        <h1 class="govuk-heading-l">${person.name}</h1>
      `)
    })

    it('should return the show a tag for an offline application', () => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person, type: 'Offline' })

      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <span class="govuk-caption-l">heading</span>
        <h1 class="govuk-heading-l">${person.name}</h1>
        <strong class="govuk-tag govuk-tag--grey govuk-!-margin-5">Offline application</strong>
      `)
    })
  })

  describe('applicationMenuItems', () => {
    it('should return the old withdrawal link when NEW_WITHDRAWALS_FLOW_DISABLED is truthy', () => {
      process.env.NEW_WITHDRAWALS_FLOW_DISABLED = '1'
      const application = applicationFactory.build()
      expect(applicationMenuItems(application, ['applicant'])).toEqual([
        {
          text: 'Withdraw application',
          href: paths.applications.withdraw.new({ id: application.id }),
          classes: 'govuk-button--secondary',
          attributes: {
            'data-cy-withdraw-application': application.id,
          },
        },
      ])
    })

    it('should return the new withdrawal link when NEW_WITHDRAWALS_FLOW_DISABLED is falsy', () => {
      process.env.NEW_WITHDRAWALS_FLOW_DISABLED = ''
      const application = applicationFactory.build()
      expect(applicationMenuItems(application, ['excluded_from_assess_allocation'])).toEqual([
        {
          text: 'Withdraw application',
          href: paths.applications.withdrawables.show({ id: application.id }),
          classes: 'govuk-button--secondary',
          attributes: {
            'data-cy-withdraw-application': application.id,
          },
        },
      ])
    })

    it('should return an appeals link when userRoles includes appeals_manager and the application has been rejected', () => {
      const application = applicationFactory.build({ status: 'rejected' })
      expect(applicationMenuItems(application, ['appeals_manager'])).toEqual([
        {
          text: 'Withdraw application',
          href: paths.applications.withdrawables.show({ id: application.id }),
          classes: 'govuk-button--secondary',
          attributes: {
            'data-cy-withdraw-application': application.id,
          },
        },
        {
          text: 'Process an appeal',
          href: paths.applications.appeals.new({ id: application.id }),
          classes: 'govuk-button--secondary',
          attributes: {
            'data-cy-appeal-application': application.id,
          },
        },
      ])
    })

    it('should not return an appeals link when userRoles includes appeals_manager and the application has not been rejected', () => {
      const application = applicationFactory.build({ status: 'assesmentInProgress' })
      expect(applicationMenuItems(application, ['appeals_manager'])).toEqual([
        {
          text: 'Withdraw application',
          href: paths.applications.withdrawables.show({ id: application.id }),
          classes: 'govuk-button--secondary',
          attributes: {
            'data-cy-withdraw-application': application.id,
          },
        },
      ])
    })

    it('should not return an appeals link when userRoles does not include appeals_manager and the application has been rejected', () => {
      const application = applicationFactory.build({ status: 'rejected' })
      expect(applicationMenuItems(application, ['assessor'])).toEqual([
        {
          text: 'Withdraw application',
          href: paths.applications.withdrawables.show({ id: application.id }),
          classes: 'govuk-button--secondary',
          attributes: {
            'data-cy-withdraw-application': application.id,
          },
        },
      ])
    })
  })

  describe('applicationIdentityBar', () => {
    it('should return the identity bar', () => {
      const application = applicationFactory.build()

      expect(applicationIdentityBar(application, 'title', ['appeals_manager'])).toEqual({
        title: { html: applicationTitle(application, 'title') },
        classes: 'application-identity-bar',
        menus: [{ items: applicationMenuItems(application, ['appeals_manager']) }],
      })
    })
  })
})
