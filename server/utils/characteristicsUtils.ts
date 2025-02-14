import { Cas1SpaceBookingCharacteristic, CharacteristicPair } from '@approved-premises/api'
import { makeArrayOfType } from './utils'

export const roomCharacteristicMap: Record<Cas1SpaceBookingCharacteristic, string> = {
  isWheelchairDesignated: 'Wheelchair accessible',
  isStepFreeDesignated: 'Step-free',
  hasEnSuite: 'En-suite',
  isSingle: 'Single room',
  isArsonSuitable: 'Suitable for active arson risk',
  isSuitedForSexOffenders: 'Suitable for sexual offence risk',
}

export const characteristicsPairToCharacteristics = (
  characteristicPairs: Array<CharacteristicPair>,
): Array<Cas1SpaceBookingCharacteristic> =>
  (makeArrayOfType<CharacteristicPair>(characteristicPairs) || [])
    .map(
      ({ propertyName }) =>
        (roomCharacteristicMap[propertyName] ? propertyName : null) as Cas1SpaceBookingCharacteristic,
    )
    .filter(Boolean)

export const characteristicsBulletList = (characteristics: Array<Cas1SpaceBookingCharacteristic>): string =>
  `<ul class="govuk-list govuk-list--bullet">${characteristics
    .filter(characteristic => roomCharacteristicMap[characteristic])
    .map(characteristic => `<li>${roomCharacteristicMap[characteristic]}</li>`)
    .join('')}</ul>`
