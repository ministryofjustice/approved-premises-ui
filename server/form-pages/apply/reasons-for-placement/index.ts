import { Section } from '../../utils/decorators'

import BasicInformation from './basic-information'
import TypeOfAp from './type-of-ap'

@Section({ name: 'Type of AP required', tasks: [BasicInformation, TypeOfAp] })
export default class ReasonsForPlacement {}
