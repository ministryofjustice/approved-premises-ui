import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { PersonService } from '../../../../services'
import applicationFactory from '../../../../testutils/factories/application'
import oasysSectionsFactory from '../../../../testutils/factories/oasysSections'
import risksFactory from '../../../../testutils/factories/risks'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { oasysImportReponse } from '../../../../utils/oasysImportUtils'
import RoshSummary from './roshSummary'

jest.mock('../../../../services/personService.ts')

describe('RoshSummary', () => {
  const oasysSections = oasysSectionsFactory.build()
  const personRisks = risksFactory.build()
  const application = applicationFactory.build()

  describe('initialize', () => {
    const getOasysSectionsMock = jest.fn().mockResolvedValue(oasysSections)
    const getPersonRisksMock = jest.fn().mockResolvedValue(personRisks)
    let personService: DeepMocked<PersonService>

    beforeEach(() => {
      personService = createMock<PersonService>({
        getOasysSections: getOasysSectionsMock,
        getPersonRisks: getPersonRisksMock,
      })
    })

    it('calls the getOasysSections and getPersonRisks method on the client with a token and the persons CRN', async () => {
      await RoshSummary.initialize({}, application, 'some-token', { personService })

      expect(getOasysSectionsMock).toHaveBeenCalledWith('some-token', application.person.crn)
      expect(getPersonRisksMock).toHaveBeenCalledWith('some-token', application.person.crn)
    })

    it('adds the roshSummary and personRisks to the page object', async () => {
      const page = await RoshSummary.initialize({}, application, 'some-token', { personService })

      expect(page.roshSummary).toEqual(oasysSections.roshSummary)
      expect(page.risks).toEqual(personRisks)
    })

    itShouldHaveNextValue(new RoshSummary({}), '')

    itShouldHavePreviousValue(new RoshSummary({}), 'optional-oasys-sections')

    describe('errors', () => {
      it('should return an empty object', () => {
        const page = new RoshSummary({})
        expect(page.errors()).toEqual({})
      })
    })

    describe('response', () => {
      it('calls oasysImportReponse with the correct arguments', () => {
        const answers = ['answer 1']
        const summaries = [
          {
            questionNumber: '1',
            label: 'The first question',
            answer: 'Some answer for the first question',
          },
        ]
        const page = new RoshSummary({ roshAnswers: answers, roshSummaries: summaries })
        const result = page.response()
        expect(result).toEqual(oasysImportReponse(answers, summaries))
      })
    })
  })
})
