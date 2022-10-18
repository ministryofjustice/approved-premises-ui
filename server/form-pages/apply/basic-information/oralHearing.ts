import type { ObjectWithDateParts, YesOrNo } from 'approved-premises'
import type { Application } from 'approved-premises-api-types'

import TasklistPage from '../../tasklistPage'
import { dateAndTimeInputsAreValidDates, dateIsBlank, DateFormats } from '../../../utils/dateUtils'
import { convertToTitleCase } from '../../../utils/utils'

export default class OralHearing implements TasklistPage {
  name = 'oral-hearing'

  title = `Do you know ${this.application.person.name}’s oral hearing date?`

  body: ObjectWithDateParts<'oralHearingDate'> & {
    knowOralHearingDate: YesOrNo
  }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      'oralHearingDate-year': body['oralHearingDate-year'] as string,
      'oralHearingDate-month': body['oralHearingDate-month'] as string,
      'oralHearingDate-day': body['oralHearingDate-day'] as string,
      oralHearingDate: body.oralHearingDate as string,
      knowOralHearingDate: body.knowOralHearingDate as YesOrNo,
    }
  }

  next() {
    return 'placement-date'
  }

  previous() {
    return 'release-date'
  }

  response() {
    const response = {
      [this.title]: convertToTitleCase(this.body.knowOralHearingDate),
    } as Record<string, string>

    if (this.body.knowOralHearingDate === 'yes') {
      response['Oral Hearing Date'] = DateFormats.isoDateToUIDate(this.body.oralHearingDate)
    }

    return response
  }

  errors() {
    const errors = []

    if (!this.body.knowOralHearingDate) {
      errors.push({
        propertyName: '$.knowOralHearingDate',
        errorType: 'empty',
      })
    }

    if (this.body.knowOralHearingDate === 'yes') {
      if (dateIsBlank(this.body)) {
        errors.push({
          propertyName: '$.oralHearingDate',
          errorType: 'empty',
        })
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'oralHearingDate')) {
        errors.push({
          propertyName: '$.oralHearingDate',
          errorType: 'invalid',
        })
      }
    }

    return errors
  }
}
