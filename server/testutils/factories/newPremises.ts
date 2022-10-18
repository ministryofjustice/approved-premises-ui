import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewPremises } from 'approved-premises'

export default Factory.define<NewPremises>(() => ({
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  address: faker.address.streetAddress(),
  postcode: faker.address.zipCode(),
  notes: faker.lorem.lines(),
  service: 'temporary-accommodation',
}))
