import type { TaskListErrors } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'

export const placementPurposes = {
  publicProtection: 'Public protection',
  preventContact: 'Prevent Contact',
  readjust: 'Help individual readjust to life outside custody',
  drugAlcoholMonitoring: 'Provide drug or alcohol monitoring',
  preventSelfHarm: 'Prevent self harm or suicide',
  otherReason: 'Other (please specify)',
} as const

type PlacementPurposeT = keyof typeof placementPurposes
type PlacementPurposeBody = { placementPurposes: Array<PlacementPurposeT>; otherReason?: string }

export default class PlacementPurpose implements TasklistPage {
  name = 'placement-purpose'

  title = `What is the purpose of the AP placement?`

  body: PlacementPurposeBody

  purposes = placementPurposes

  previousPage: string

  constructor(body: Record<string, unknown>, private readonly _application: Application, previousPage: string) {
    this.body = {} as PlacementPurposeBody

    this.body.placementPurposes = body?.placementPurposes
      ? ([body.placementPurposes].flat() as Array<PlacementPurposeT>)
      : []

    if (this.responseNeedsFreeTextReason(this.body)) {
      this.body.otherReason = body.otherReason as string
    }

    this.previousPage = previousPage
  }

  next() {
    return ''
  }

  previous() {
    return this.previousPage
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.responseContainsReasons(this.body)) {
      errors.placementPurposes = 'You must choose at least one placement purpose'
    }

    if (this.responseNeedsFreeTextReason(this.body) && !this.body.otherReason) {
      errors.otherReason = 'You must explain the reason'
    }

    return errors
  }

  private responseContainsReasons(
    body: Record<string, unknown>,
  ): body is { placementPurposes: Array<PlacementPurposeT> } {
    if (body?.placementPurposes && Array.isArray(body.placementPurposes) && body.placementPurposes.length) {
      return true
    }
    return false
  }

  private responseNeedsFreeTextReason(body: Record<string, unknown>) {
    if (this.responseContainsReasons(body)) {
      if (body.placementPurposes.find(element => element === 'otherReason')) {
        return true
      }
    }
    return false
  }

  items(conditionalHtml: string) {
    const items = convertKeyValuePairToCheckBoxItems(placementPurposes, this.body?.placementPurposes)
    const other = items.pop()

    items.push({
      divider: 'or',
    })

    return [...items, { ...other, conditional: { html: conditionalHtml } }]
  }

  response() {
    const response = { [this.title]: this.body.placementPurposes.map(purpose => placementPurposes[purpose]).join(', ') }

    if (this.body.otherReason) {
      response['Other purpose for AP Placement'] = this.body.otherReason
    }

    return response
  }
}
