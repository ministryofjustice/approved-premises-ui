import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewArrival } from '@approved-premises-shared'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewArrival>(() => ({
  arrivalDate: DateFormats.formatApiDate(faker.date.soon()),
  expectedDepartureDate: DateFormats.formatApiDate(faker.date.future()),
  notes: faker.lorem.sentence(),
  keyWorkerStaffId: faker.datatype.number(),
}))
