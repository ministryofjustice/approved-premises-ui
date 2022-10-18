import type { ObjectWithDateParts, YesOrNo } from 'approved-premises'
import type { Application } from 'server/@types/api'

import TasklistPage from '../../tasklistPage'
import { retrieveQuestionResponseFromApplication, convertToTitleCase } from '../../../utils/utils'
import { dateIsBlank, dateAndTimeInputsAreValidDates, DateFormats } from '../../../utils/dateUtils'

export default class PlacementDate implements TasklistPage {
  name = 'placement-date'

  title: string

  body: ObjectWithDateParts<'startDate'> & {
    startDateSameAsReleaseDate: YesOrNo
  }

  constructor(body: Record<string, unknown>, application: Application) {
    this.body = {
      'startDate-year': body['startDate-year'] as string,
      'startDate-month': body['startDate-month'] as string,
      'startDate-day': body['startDate-day'] as string,
      startDate: body.startDate as string,
      startDateSameAsReleaseDate: body.startDateSameAsReleaseDate as YesOrNo,
    }

    const formattedReleaseDate = DateFormats.isoDateToUIDate(
      retrieveQuestionResponseFromApplication(application, 'basic-information', 'releaseDate'),
    )

    this.title = `Is ${formattedReleaseDate} the date you want the placement to start?`
  }

  next() {
    return ''
  }

  previous() {
    return 'oral-hearing'
  }

  response() {
    const response = {
      [this.title]: convertToTitleCase(this.body.startDateSameAsReleaseDate),
    } as Record<string, string>

    if (this.body.startDateSameAsReleaseDate === 'no') {
      response['Placement Start Date'] = DateFormats.isoDateToUIDate(this.body.startDate)
    }

    return response
  }

  errors() {
    const errors = []

    if (!this.body.startDateSameAsReleaseDate) {
      errors.push({
        propertyName: '$.startDateSameAsReleaseDate',
        errorType: 'empty',
      })
    }

    if (this.body.startDateSameAsReleaseDate === 'no') {
      if (dateIsBlank(this.body)) {
        errors.push({
          propertyName: '$.startDate',
          errorType: 'empty',
        })
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'startDate')) {
        errors.push({
          propertyName: '$.startDate',
          errorType: 'invalid',
        })
      }
    }

    return errors
  }
}
