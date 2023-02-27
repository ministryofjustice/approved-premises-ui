import { ContingencyPlanQuestionsBody } from '../../../../@types/ui'
import contingencyPlanQuestionsBodyFactory from '../../../../testutils/factories/contingencyPlanQuestionsBody'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ContingencyPlanQuestions from './contingencyPlanQuestions'

describe('ContingencyPlanQuestions', () => {
  const body = contingencyPlanQuestionsBodyFactory.build()

  describe('title', () => {
    it('should set the title', () => {
      const page = new ContingencyPlanQuestions(body)

      expect(page.title).toEqual('Contingency plans')
    })
  })

  describe('body', () => {
    const page = new ContingencyPlanQuestions(body)

    expect(page.body).toEqual(body)
  })

  itShouldHaveNextValue(new ContingencyPlanQuestions(body), '')

  itShouldHavePreviousValue(new ContingencyPlanQuestions(body), 'contingency-plan-partners')

  describe('errors', () => {
    const page = new ContingencyPlanQuestions({} as ContingencyPlanQuestionsBody)

    expect(page.errors()).toEqual({
      noReturn: 'You must detail the actions that should be taken if the person does not return to the AP for curfew',
      placementWithdrawn:
        "You must detail any actions that should be taken if the person's placement needs to be withdrawn out of hours",
      victimConsiderations:
        'You must detail any victim considerations that the AP need to be aware of when out of hours',
      unsuitableAddresses: 'You must detail any unsuitable addresses that the person cannot reside at',
      suitableAddresses: 'You must detail alternative suitable addresses that the person can reside at',
      breachInformation: 'You must detail any further information to support OoH decision making',
      otherConsiderations: 'You must detail any other considerations',
    })
  })

  describe('response', () => {
    it('should return the responses to the question in plain english', () => {
      const page = new ContingencyPlanQuestions(body)

      expect(page.response()).toEqual({
        'Are there any other considerations?': body.otherConsiderations,
        'If the person does not return to the AP for curfew, what actions should be taken?': body.noReturn,
        "If the person's placement needs to be withdrawn out of hours, what actions should be taken?":
          body.placementWithdrawn,
        'In the event of a breach, provide any further information to support Out of Hours (OoH) decision making':
          body.breachInformation,
        'In the event of an out of hours placement withdrawal, provide alternative suitable addresses that the person can reside at':
          body.suitableAddresses,
        'In the event of an out of hours placement withdrawal, provide any unsuitable addresses that the person cannot reside at':
          body.unsuitableAddresses,
        'Provide any victim considerations that the AP need to be aware of when out of hours':
          body.victimConsiderations,
      })
    })
  })
})
