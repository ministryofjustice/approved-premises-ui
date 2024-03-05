import { differenceInDays } from 'date-fns'
import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { DateFormats } from '../dateUtils'

type ApplicationType = 'emergency' | 'short_notice' | 'standard'

export const noticeTypeFromApplication = (application: Application): ApplicationType => {
  const arrivalDateString = arrivalDateFromApplication(application)

  if (!arrivalDateString) return 'standard'

  const arrivalDateObj = DateFormats.isoToDateObj(arrivalDateString)

  switch (true) {
    case differenceInDays(arrivalDateObj, new Date()) <= 7:
      return 'emergency'
    case differenceInDays(arrivalDateObj, new Date()) <= 28:
      return 'short_notice'
    default:
      return 'standard'
  }
}
