import {
  characteristicsBulletList,
  characteristicsPairToCharacteristics,
  // translateCharacteristic,
} from './characteristicsUtils'
import { Cas1SpaceBookingCharacteristic, CharacteristicPair } from '../@types/shared'

describe('characteristicsUtils.translateCharacteristic(CharacteristicPair)', () => {
  // describe('when the propertyName is found', () => {
  //   const propertyNameFoundInTranslation = 'isSingle'
  //   const successfulTranslation = 'Single room'
  //   const characteristicWithTranslation = <CharacteristicPair>{
  //     propertyName: propertyNameFoundInTranslation,
  //     name: 'Is this a single room?',
  //   }
  //
  //   it('returns the translation (in the form of a statement) for the characteristic', () => {
  //     expect(translateCharacteristic(characteristicWithTranslation)).toEqual(successfulTranslation)
  //   })
  // })
  //
  // describe('when the propertyName is NOT found', () => {
  //   const propertyNameNotFoundInTranslation = 'isRed'
  //   const characteristicWithoutTranslation = <CharacteristicPair>{
  //     propertyName: propertyNameNotFoundInTranslation,
  //     name: 'Is this a a red room?',
  //   }
  //
  //   it('returns the propertyName as a (just) human-readable fallback', () => {
  //     expect(translateCharacteristic(characteristicWithoutTranslation)).toEqual('isRed')
  //   })
  // })

  describe('characteristicsPairToCharacteristics', () => {
    it('should flatten and filter a list of characteristicPairs', () => {
      const charactisticPairList: Array<CharacteristicPair> = [
        { propertyName: 'isArsonSuitable', name: 'Arson' },
        { propertyName: 'isSingle', name: 'Single' },
        { propertyName: 'NotARoomCharacteristic', name: 'Bad' },
      ]

      const expected: Array<Cas1SpaceBookingCharacteristic> = ['isArsonSuitable', 'isSingle']
      expect(characteristicsPairToCharacteristics(charactisticPairList)).toEqual(expected)
    })
  })

  describe('characteristicsBulletList', () => {
    it('should generate a characteristics bullet list', () => {
      const characteristics: Array<Cas1SpaceBookingCharacteristic> = ['isArsonSuitable', 'isSingle']
      expect(characteristicsBulletList(characteristics)).toEqual(
        '<ul class="govuk-list govuk-list--bullet"><li>Suitable for active arson risk</li><li>Single room</li></ul>',
      )
    })
  })
})
