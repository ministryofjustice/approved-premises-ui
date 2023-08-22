import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '@approved-premises/api'
import { sentenceCase } from '../../../../utils/utils'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { nameOrPlaceholderCopy } from '../../../../utils/personUtils'

type EsapNationalSecurityDivisionBody = {
  managedByNationalSecurityDivision: YesOrNo
}

@Page({
  name: 'managed-by-national-security-division',
  bodyProperties: ['managedByNationalSecurityDivision'],
})
export default class EsapNationalSecurityDivision implements TasklistPage {
  title = `Is ${nameOrPlaceholderCopy(this.application.person)} managed by the National Security Division?`

  constructor(
    public body: Partial<EsapNationalSecurityDivisionBody>,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  response() {
    return { [this.title]: sentenceCase(this.body.managedByNationalSecurityDivision) }
  }

  previous() {
    return 'ap-type'
  }

  next() {
    if (this.body.managedByNationalSecurityDivision === 'yes') {
      return 'esap-placement-screening'
    }
    return 'esap-exceptional-case'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.managedByNationalSecurityDivision) {
      errors.managedByNationalSecurityDivision = `You must state if ${nameOrPlaceholderCopy(
        this.application.person,
      )} is managed by the National Security Division`
    }

    return errors
  }
}
