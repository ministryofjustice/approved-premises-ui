import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Application } from '@approved-premises-shared'

import personFactory from './person'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Application>(() => ({
  id: faker.datatype.uuid(),
  person: personFactory.build(),
  createdByProbationOfficerId: faker.datatype.uuid(),
  schemaVersion: faker.datatype.uuid(),
  createdAt: DateFormats.formatApiDate(faker.date.past()),
  submittedAt: DateFormats.formatApiDate(faker.date.past()),
  data: JSON.parse(faker.datatype.json()),
  document: JSON.parse(faker.datatype.json()),
  outdatedSchema: faker.datatype.boolean(),
  isWomensApplication: faker.datatype.boolean(),
  isPipeApplication: faker.datatype.boolean(),
}))
