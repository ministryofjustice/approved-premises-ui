import type { Person } from '@approved-premises-ui'

import Page from '../page'

export default class TypeOfApPage extends Page {
  constructor(person: Person) {
    super(`Which type of AP does ${person.name} require?`)
  }
}
