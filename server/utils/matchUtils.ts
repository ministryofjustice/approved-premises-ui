import { addDays, weeksToDays } from 'date-fns'
import {
  Cas1SpaceNeedCharacteristic,
  Cas1SpaceRiskCharacteristic,
  PlacementRequest,
  Cas1SpaceSearchParameters as SpaceSearchParameters,
  Cas1SpaceSearchResult as SpaceSearchResult,
} from '../@types/shared'
import { ObjectWithDateParts, SpaceSearchParametersUi, SummaryListItem } from '../@types/ui'
import { DateFormats, daysToWeeksAndDays } from './dateUtils'
import { createQueryString } from './utils'
import matchPaths from '../paths/match'
import { apTypeLabels } from '../form-pages/apply/reasons-for-placement/type-of-ap/apType'

type PlacementDates = {
  placementLength: number
  startDate: string
  endDate: string
}

export class InvalidSpaceSearchDataException extends Error {}

export type SearchFilterCategories = 'apType' | 'offenceAndRisk' | 'placementRequirements'

export const mapPlacementRequestForSpaceSearch = (placementRequest: PlacementRequest) => {
  return {
    startDate: placementRequest.expectedArrival,
    targetPostcodeDistrict: placementRequest.location,
  }
}

export const mapUiParamsForApi = (query: SpaceSearchParametersUi): SpaceSearchParameters => {
  const durationInDays = weeksToDays(Number(query.durationWeeks)) + Number(query.durationDays)

  return {
    startDate: query.startDate,
    targetPostcodeDistrict: query.targetPostcodeDistrict,
    requirements: {
      ...query.requirements,
    },
    durationInDays,
  }
}

export const encodeSpaceSearchResult = (spaceSearchResult: SpaceSearchResult): string => {
  const json = JSON.stringify(spaceSearchResult)

  return Buffer.from(json).toString('base64')
}

export const decodeSpaceSearchResult = (string: string): SpaceSearchResult => {
  const json = Buffer.from(string, 'base64').toString('utf-8')
  const obj = JSON.parse(json)

  if ('premises' in obj) {
    return obj as SpaceSearchResult
  }

  throw new InvalidSpaceSearchDataException()
}

export const placementLength = (lengthInDays: number): string => {
  return DateFormats.formatDuration(daysToWeeksAndDays(lengthInDays), ['weeks', 'days'])
}

export const placementDates = (startDateString: string, lengthInDays: string): PlacementDates => {
  const days = Number(lengthInDays)
  const startDate = DateFormats.isoToDateObj(startDateString)
  const endDate = addDays(startDate, days)

  return {
    placementLength: days,
    startDate: DateFormats.dateObjToIsoDate(startDate),
    endDate: DateFormats.dateObjToIsoDate(endDate),
  }
}

export const summaryCardLink = ({
  spaceSearchResult,
  placementRequestId,
  startDate,
  durationWeeks,
  durationDays,
}: {
  spaceSearchResult: SpaceSearchResult
  placementRequestId: string
  startDate: string
  durationDays: string
  durationWeeks: string
}): string => {
  const duration = String(Number(durationWeeks) * 7 + Number(durationDays))
  return `${matchPaths.placementRequests.bookings.confirm({ id: placementRequestId })}${createQueryString(
    {
      spaceSearchResult: encodeSpaceSearchResult(spaceSearchResult),
      startDate,
      duration,
    },
    { addQueryPrefix: true },
  )}`
}

export const confirmationSummaryCardRows = (
  spaceSearchResult: SpaceSearchResult,
  dates: PlacementDates,
): Array<SummaryListItem> => {
  return [
    premisesNameRow(spaceSearchResult),
    arrivalDateRow(dates.startDate),
    departureDateRow(dates.endDate),
    placementLengthRow(dates.placementLength),
  ]
}

export const premisesNameRow = (spaceSearchResult: SpaceSearchResult) => ({
  key: {
    text: 'Approved Premises',
  },
  value: {
    text: spaceSearchResult.premises.name,
  },
})

export const arrivalDateRow = (arrivalDate: string) => ({
  key: {
    text: 'Expected arrival date',
  },
  value: {
    text: DateFormats.isoDateToUIDate(arrivalDate),
  },
})

export const departureDateRow = (departureDate: string) => ({
  key: {
    text: 'Expected departure date',
  },
  value: {
    text: DateFormats.isoDateToUIDate(departureDate),
  },
})

export const placementLengthRow = (length: number) => ({
  key: {
    text: 'Placement length',
  },
  value: {
    text: placementLength(length),
  },
})

export const summaryCardRows = (spaceSearchResult: SpaceSearchResult, postcodeArea: string): Array<SummaryListItem> => {
  return [
    apTypeRow(spaceSearchResult),
    addressRow(spaceSearchResult),
    townRow(spaceSearchResult),
    distanceRow(spaceSearchResult, postcodeArea),
  ]
}

export const apTypeRow = (spaceSearchResult: SpaceSearchResult) => ({
  key: {
    text: 'Type of AP',
  },
  value: {
    text: apTypeLabels[spaceSearchResult.premises.apType],
  },
})

export const townRow = (spaceSearchResult: SpaceSearchResult) => ({
  key: {
    text: 'Town',
  },
  value: {
    text: spaceSearchResult.premises.town,
  },
})

export const addressRow = (spaceSearchResult: SpaceSearchResult) => ({
  key: {
    text: 'Address',
  },
  value: {
    text: `${spaceSearchResult.premises.addressLine1} ${spaceSearchResult.premises.addressLine2}`,
  },
})

export const distanceRow = (spaceSearchResult: SpaceSearchResult, postcodeArea?: string) => ({
  key: {
    text: 'Distance',
  },
  value: {
    text: `${spaceSearchResult.distanceInMiles} miles from ${postcodeArea || 'the desired location'}`,
  },
})

export const startDateObjFromParams = (params: { startDate: string } | ObjectWithDateParts<'startDate'>) => {
  if (params['startDate-day'] && params['startDate-month'] && params['startDate-year']) {
    return {
      ...DateFormats.dateAndTimeInputsToIsoString(params as ObjectWithDateParts<'startDate'>, 'startDate'),
    }
  }

  return { startDate: params.startDate, ...DateFormats.isoDateToDateInputs(params.startDate, 'startDate') }
}

const needCharacteristicsLabels: Record<Cas1SpaceNeedCharacteristic, string> = {
  single: 'Single room',
  enSuite: 'En-suite room',
  wheelchair: 'Wheelchair accessible',
  limitedMobility: 'Limited mobility access',
  catered: 'No stairs',
}

const riskCharacteristicsLabels: Record<Cas1SpaceRiskCharacteristic, string> = {
  atRiskOfExploitation: 'At risk of criminal exploitation',
  arson: 'Poses an arson risk',
  hateBasedOffences: 'Has committed hate-based offences',
  posesSexualRiskToAdults: 'Poses a sexual risk to adults',
  posesSexualRiskToChildren: 'Poses a sexual risk to children',
  posesNonSexualRiskToChildren: 'Poses a non-sexual risk to children',
}

export const matchPageCheckboxes = {
  apTypes: {
    label: 'AP Type',
    options: apTypeLabels,
  },
  needCharacteristics: {
    label: 'Need characteristics',
    options: needCharacteristicsLabels,
  },
  riskCharacteristics: {
    label: 'Risk characteristics',
    options: riskCharacteristicsLabels,
  },
  genders: {
    label: 'Gender',
    options: {
      male: 'Male',
      female: 'Female',
    },
  },
}
