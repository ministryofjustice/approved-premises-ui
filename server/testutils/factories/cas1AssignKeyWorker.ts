import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas1AssignKeyWorker } from '@approved-premises/api'

export default Factory.define<Cas1AssignKeyWorker>(() => ({
  staffCode: faker.string.alphanumeric(5),
}))
