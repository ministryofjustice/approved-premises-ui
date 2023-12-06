import { PlacementApplication } from '../../@types/shared'
import AdditionalPlacementDetails from '../../form-pages/placement-application/request-a-placement/additionalPlacementDetails'
import DatesOfPlacement from '../../form-pages/placement-application/request-a-placement/datesOfPlacement'
import DecisionToRelease from '../../form-pages/placement-application/request-a-placement/decisionToRelease'
import { getPageName, pageDataFromApplicationOrAssessment } from '../../form-pages/utils'
import { addResponseToFormArtifact } from '../../testutils/addToApplication'
import { applicationFactory, placementApplicationFactory } from '../../testutils/factories'
import { placementDurationFromApplication } from '../assessments/placementDurationFromApplication'
import {
  durationAndArrivalDateFromPlacementApplication,
  durationAndArrivalDateFromRotlPlacementApplication,
  placementApplicationSubmissionData,
} from './placementApplicationSubmissionData'

jest.mock('../../form-pages/utils')
jest.mock('../../utils/assessments/placementDurationFromApplication')

const datesOfPlacement = [
  {
    duration: '15',
    durationDays: '1',
    durationWeeks: '2',
    'arrivalDate-year': '2023',
    'arrivalDate-month': '12',
    'arrivalDate-day': '1',
    arrivalDate: '2023-12-01',
  },
  {
    duration: '23',
    durationDays: '2',
    durationWeeks: '3',
    'arrivalDate-year': '2024',
    'arrivalDate-month': '1',
    'arrivalDate-day': '2',
    arrivalDate: '2024-01-02',
  },
]

const datesOfPlacementForApi = [
  {
    duration: 15,
    expectedArrival: '2023-12-01',
  },
  {
    duration: 23,
    expectedArrival: '2024-01-02',
  },
]

describe('placementApplicationSubmissionData', () => {
  it('returns the data in the correct format for submission', () => {
    let placementApplication = placementApplicationFactory.build()

    placementApplication = addResponseToFormArtifact(placementApplication, {
      task: 'request-a-placement',
      page: 'reason-for-placement',
      key: 'reason',
      value: 'rotl',
    })
    placementApplication = addResponseToFormArtifact(placementApplication, {
      task: 'request-a-placement',
      page: 'dates-of-placement',
      key: 'datesOfPlacement',
      value: datesOfPlacement,
    })
    ;(pageDataFromApplicationOrAssessment as jest.MockedFn<typeof pageDataFromApplicationOrAssessment>).mockReturnValue(
      {
        reason: 'rotl',
        datesOfPlacement,
      },
    )
    ;(getPageName as jest.MockedFn<typeof getPageName>).mockReturnValueOnce('reason')
    ;(getPageName as jest.MockedFn<typeof getPageName>).mockReturnValueOnce('dates-of-placement')

    expect(placementApplicationSubmissionData(placementApplication, applicationFactory.build())).toEqual({
      placementType: 'rotl',
      translatedDocument: {},
      placementDates: datesOfPlacementForApi,
    })
  })
})

describe('durationAndArrivalDateFromRotlPlacementApplication', () => {
  it('returns a expectedArrival and duration key for each date of placement', () => {
    expect(durationAndArrivalDateFromRotlPlacementApplication(datesOfPlacement[0])).toEqual({
      duration: 15,
      expectedArrival: '2023-12-01',
    })
  })
})

describe('durationAndArrivalDateFromPlacementApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the arrivalDate and duration from the dates-of-placement page if the "reason" is "rotl"', () => {
    let placementApplication = placementApplicationFactory.build({
      data: { 'request-a-placement': { 'reason-for-placement': { reason: 'rotl' } } },
    })
    placementApplication = addResponseToFormArtifact(placementApplication, {
      task: 'request-a-placement',
      page: 'dates-of-placement',
      key: 'datesOfPlacement',
      value: datesOfPlacement,
    }) as PlacementApplication
    ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({
      datesOfPlacement,
    })

    expect(
      durationAndArrivalDateFromPlacementApplication(placementApplication, 'rotl', applicationFactory.build()),
    ).toEqual(datesOfPlacementForApi)
    expect(pageDataFromApplicationOrAssessment).toHaveBeenCalledWith(DatesOfPlacement, placementApplication)
  })

  it('returns the arrivalDate and duration from the additional-placement-details page if the "reason" is "additional_placement"', () => {
    const placementApplication = placementApplicationFactory.build({
      data: { 'request-a-placement': { 'reason-for-placement': { reason: 'rotl' } } },
    })

    ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({
      arrivalDate: '2023-01-01',
      duration: '1',
    })

    expect(
      durationAndArrivalDateFromPlacementApplication(
        placementApplication,
        'additional_placement',
        applicationFactory.build(),
      ),
    ).toEqual({
      expectedArrival: '2023-01-01',
      duration: 1,
    })
    expect(pageDataFromApplicationOrAssessment).toHaveBeenCalledWith(AdditionalPlacementDetails, placementApplication)
  })

  it('calculates the release date to be decision to release date + 6 weeks and retrieves the placement duration from the application if the "reason" is "release_following_decision"', () => {
    const placementApplication = placementApplicationFactory.build({
      data: { 'request-a-placement': { 'reason-for-placement': { reason: 'release_following_decision' } } },
    })

    ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({
      decisionToReleaseDate: '2023-01-01',
      duration: '1',
    })
    ;(placementDurationFromApplication as jest.Mock).mockReturnValue('1')

    expect(
      durationAndArrivalDateFromPlacementApplication(
        placementApplication,
        'release_following_decision',
        applicationFactory.build(),
      ),
    ).toEqual({
      duration: '1',
      expectedArrival: '2023-02-12',
    })
    expect(pageDataFromApplicationOrAssessment).toHaveBeenCalledWith(DecisionToRelease, placementApplication)
  })
})
