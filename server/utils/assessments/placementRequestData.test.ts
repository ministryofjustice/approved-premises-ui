import { createMock } from '@golevelup/ts-jest'
import { mockOptionalQuestionResponse, mockQuestionResponse } from '../../testutils/mockQuestionResponse'
import { MatchingInformationBody } from '../../form-pages/assess/matchingInformation/matchingInformationTask/matchingInformation'
import { criteriaFromMatchingInformation, placementRequestData } from './placementRequestData'
import { assessmentFactory } from '../../testutils/factories'
import { pageDataFromApplicationOrAssessment } from '../../form-pages/utils'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import { getDefaultPlacementDurationInWeeks } from '../applications/getDefaultPlacementDurationInWeeks'

jest.mock('../../form-pages/utils')
jest.mock('../retrieveQuestionResponseFromApplicationOrAssessment')
jest.mock('../applications/getDefaultPlacementDurationInWeeks')
jest.mock('../applications/arrivalDateFromApplication')

describe('placementRequestData', () => {
  const assessment = assessmentFactory.build()
  const expectedArrival = '2020-01-01'

  let matchingInformation = createMock<MatchingInformationBody>({
    apType: 'isEsap',
    mentalHealthSupport: '1',
  })

  ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue(matchingInformation)
  ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2020-01-01')

  it('converts matching data into a placement request', () => {
    mockQuestionResponse({ postcodeArea: 'ABC123', type: 'normal', duration: '12' })
    mockOptionalQuestionResponse({ duration: '12', alternativeRadius: '100' })

    expect(placementRequestData(assessment)).toEqual({
      gender: 'male',
      type: 'esap',
      expectedArrival,
      duration: '12',
      location: 'ABC123',
      radius: '100',
      mentalHealthSupport: true,
      essentialCriteria: criteriaFromMatchingInformation(matchingInformation).essentialCriteria,
      desirableCriteria: criteriaFromMatchingInformation(matchingInformation).desirableCriteria,
    })
  })

  it('returns a default radius if one is not present', () => {
    mockOptionalQuestionResponse({ duration: '12', alternativeRadius: undefined })

    const result = placementRequestData(assessment)

    expect(result.radius).toEqual(50)
  })

  it('returns the default placement duration if one is not present', () => {
    ;(getDefaultPlacementDurationInWeeks as jest.Mock).mockReturnValueOnce(52)
    mockOptionalQuestionResponse({ duration: undefined, alternativeRadius: '100' })

    const result = placementRequestData(assessment)

    expect(result.duration).toEqual(52)
  })

  it('returns a false mentalHealthSupport requirement if the mentalHealthSupport matching information is blank', () => {
    matchingInformation = createMock<MatchingInformationBody>({
      mentalHealthSupport: '',
    })
    ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue(matchingInformation)

    const result = placementRequestData(assessment)

    expect(result.mentalHealthSupport).toEqual(false)
  })

  describe('criteriaFromMatchingInformation', () => {
    it('returns all essential criteria for essential and relevant matching information', () => {
      matchingInformation = createMock<MatchingInformationBody>({
        apType: 'isEsap',
        mentalHealthSupport: '1',
        isWheelchairDesignated: 'essential',
        isStepFreeDesignated: 'essential',
        isCatered: 'essential',
        acceptsSexOffenders: 'relevant',
        acceptsChildSexOffenders: 'relevant',
        acceptsNonSexualChildOffenders: 'relevant',
        isArsonSuitable: 'relevant',
        acceptsHateCrimeOffenders: 'relevant',
        isSuitableForVulnerable: 'relevant',
      })

      const result = criteriaFromMatchingInformation(matchingInformation)

      expect(result.desirableCriteria).toEqual([])
      expect(result.essentialCriteria.sort()).toEqual(
        [
          'isEsap',
          'isWheelchairDesignated',
          'isStepFreeDesignated',
          'isCatered',
          'acceptsSexOffenders',
          'acceptsChildSexOffenders',
          'acceptsNonSexualChildOffenders',
          'isArsonSuitable',
          'acceptsHateCrimeOffenders',
          'isSuitableForVulnerable',
          'isSuitedForSexOffenders',
          'isSemiSpecialistMentalHealth',
        ].sort(),
      )
    })

    it('returns all desirable criteria for desirable matching information', () => {
      matchingInformation = createMock<MatchingInformationBody>({
        mentalHealthSupport: undefined,
        apType: 'normal',
        isWheelchairDesignated: 'desirable',
        isStepFreeDesignated: 'desirable',
        isCatered: 'desirable',
      })

      const result = criteriaFromMatchingInformation(matchingInformation)

      expect(result.desirableCriteria.sort()).toEqual(
        ['isStepFreeDesignated', 'isWheelchairDesignated', 'isCatered'].sort(),
      )
      expect(result.essentialCriteria).toEqual([])
    })

    it('returns empty objects for not relevant matching information', () => {
      matchingInformation = createMock<MatchingInformationBody>({
        apType: 'normal',
        mentalHealthSupport: '',
        isWheelchairDesignated: 'notRelevant',
        isStepFreeDesignated: 'notRelevant',
        isCatered: 'notRelevant',
        acceptsSexOffenders: 'notRelevant',
        acceptsChildSexOffenders: 'notRelevant',
        acceptsNonSexualChildOffenders: 'notRelevant',
        isArsonSuitable: 'notRelevant',
        acceptsHateCrimeOffenders: 'notRelevant',
        isSuitableForVulnerable: 'notRelevant',
      })

      expect(criteriaFromMatchingInformation(matchingInformation)).toEqual({
        desirableCriteria: [],
        essentialCriteria: [],
      })
    })
  })
})
