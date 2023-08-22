import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'
import { nameOrPlaceholderCopy } from '../../../../utils/personUtils'

@Page({ name: 'transgender', bodyProperties: ['transgenderOrHasTransgenderHistory'] })
export default class IsPersonTransgender implements TasklistPage {
  question = `Is ${nameOrPlaceholderCopy(this.application.person)} transgender or do they have a transgender history?`

  title = this.question

  constructor(
    public body: { transgenderOrHasTransgenderHistory: YesOrNo },
    private readonly application: ApprovedPremisesApplication,
  ) {}

  previous() {
    return 'exception-details'
  }

  next() {
    return this.body.transgenderOrHasTransgenderHistory === 'yes' ? 'complex-case-board' : 'end-dates'
  }

  response() {
    return {
      [this.question]: sentenceCase(this.body.transgenderOrHasTransgenderHistory),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.transgenderOrHasTransgenderHistory) {
      errors.transgenderOrHasTransgenderHistory = `You must specify if ${nameOrPlaceholderCopy(
        this.application.person,
      )} is transgender of if they have a transgender history`
    }

    return errors
  }
}
