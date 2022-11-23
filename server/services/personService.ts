import type { PersonRisksUI } from '@approved-premises/ui'
import type { Person, PrisonCaseNote } from '@approved-premises/api'
import type { RestClientBuilder, PersonClient } from '../data'

import { mapApiPersonRisksForUi } from '../utils/utils'

export default class PersonService {
  constructor(private readonly personClientFactory: RestClientBuilder<PersonClient>) {}

  async findByCrn(token: string, crn: string): Promise<Person> {
    const personClient = this.personClientFactory(token)

    const person = await personClient.search(crn)
    return person
  }

  async getPersonRisks(token: string, crn: string): Promise<PersonRisksUI> {
    const personClient = this.personClientFactory(token)

    const risks = await personClient.risks(crn)

    return mapApiPersonRisksForUi(risks)
  }

  async getPrisonCaseNotes(token: string, crn: string): Promise<PrisonCaseNote[]> {
    const personClient = this.personClientFactory(token)

    const prisonCaseNotes = await personClient.prisonCaseNotes(crn)

    return prisonCaseNotes
  }
}
