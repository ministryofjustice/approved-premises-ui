import { Cas1SpaceCharacteristic, Cas1TimelineEvent, NamedId } from '@approved-premises/api'
import nunjucks from 'nunjucks'
import path from 'path'
import { escape } from './formUtils'
import { linebreaksToParagraphs } from './utils'
import { DateFormats } from './dateUtils'
import { filterRoomLevelCriteria } from './match/spaceSearch'
import { criteriaListInline } from './premises/occupancy'

type PayloadBookingChange = {
  premises: NamedId
  expectedArrival: string
  expectedDeparture: string
  previousExpectedArrival?: string
  previousExpectedDeparture?: string
  characteristics: Array<Cas1SpaceCharacteristic>
  previousCharacteristics: Array<Cas1SpaceCharacteristic>
}

export const renderTimelineEventContent = (event: Cas1TimelineEvent): string => {
  if (event.payload) {
    nunjucks.configure(path.join(__dirname, '../views/partials/timelineEvents'))

    if (event.payload.type === 'booking_changed') {
      const {
        premises,
        expectedArrival,
        expectedDeparture,
        previousExpectedArrival,
        previousExpectedDeparture,
        characteristics,
        previousCharacteristics,
      } = event.payload as unknown as PayloadBookingChange

      const isoDateToUiDateOrUndefined = (isoDate: string) =>
        isoDate ? DateFormats.isoDateToUIDate(isoDate) : undefined
      const roomCriteriaOrNone = (criteria: Array<Cas1SpaceCharacteristic>) =>
        criteriaListInline(filterRoomLevelCriteria(criteria)) || 'None'

      const context = {
        premises,
        expectedArrival: isoDateToUiDateOrUndefined(expectedArrival),
        expectedDeparture: isoDateToUiDateOrUndefined(expectedDeparture),
        previousExpectedArrival: isoDateToUiDateOrUndefined(previousExpectedArrival),
        previousExpectedDeparture: isoDateToUiDateOrUndefined(previousExpectedDeparture),
        characteristics: roomCriteriaOrNone(characteristics),
        previousCharacteristics: roomCriteriaOrNone(previousCharacteristics),
      }

      return nunjucks.render('booking_changed.njk', context)
    }
  }

  return linebreaksToParagraphs(escape(event.content))
}
