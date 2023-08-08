import { add } from 'date-fns'
import { PlacementRequest, PlacementRequestStatus, PlacementRequestTask, SortDirection } from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import matchPaths from '../../paths/match'
import adminPaths from '../../paths/admin'
import { DateFormats } from '../dateUtils'
import { linkTo } from '../utils'
import { crnCell, tierCell } from '../tableUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { daysToWeeksAndDays } from '../assessments/dateUtils'
import { sortHeader } from '../sortHeader'

export const DIFFERENCE_IN_DAYS_BETWEEN_DUE_DATE_AND_ARRIVAL_DATE = 7

export const tableRows = (tasks: Array<PlacementRequestTask>): Array<TableRow> => {
  return tasks.map((task: PlacementRequestTask) => {
    return [
      nameCell(task),
      crnCell(task),
      tierCell(task),
      expectedArrivalDateCell(task),
      dueDateCell(task, DIFFERENCE_IN_DAYS_BETWEEN_DUE_DATE_AND_ARRIVAL_DATE),
      releaseTypeCell(task),
    ]
  })
}

export const dashboardTableRows = (placementRequests: Array<PlacementRequest>): Array<TableRow> => {
  return placementRequests.map((placementRequest: PlacementRequest) => {
    return [
      nameCell(placementRequest),
      crnCell(placementRequest.person),
      tierCell(placementRequest.risks),
      expectedArrivalDateCell(placementRequest),
      placementRequest.status === 'matched' ? premisesNameCell(placementRequest) : durationCell(placementRequest),
      requestTypeCell(placementRequest),
    ]
  })
}

export const requestTypeCell = (placementRequest: PlacementRequest): TableCell => {
  return {
    text: placementRequest.isParole ? 'Parole' : 'Standard release',
  }
}

export const premisesNameCell = (placementRequest: PlacementRequest): TableCell => {
  return {
    text: placementRequest.booking?.premisesName,
  }
}

export const durationCell = (placementRequest: PlacementRequest): TableCell => {
  return { text: DateFormats.formatDuration(daysToWeeksAndDays(placementRequest.duration), ['weeks', 'days']) }
}

export const dueDateCell = (task: PlacementRequestTask, differenceBetweenDueDateAndArrivalDate: number): TableCell => {
  const dateAsObject = DateFormats.isoToDateObj(task.expectedArrival)

  return {
    text: DateFormats.differenceInDays(
      dateAsObject,
      add(dateAsObject, { days: differenceBetweenDueDateAndArrivalDate }),
    ).ui,
  }
}

export const expectedArrivalDateCell = (item: PlacementRequestTask | PlacementRequest): TableCell => ({
  text: DateFormats.isoDateToUIDate(item.expectedArrival),
})

export const nameCell = (item: PlacementRequestTask | PlacementRequest): TableCell => {
  if ('personName' in item && item.personName) {
    return {
      html: linkTo(
        matchPaths.placementRequests.show,
        { id: item.id },
        { text: item.personName, attributes: { 'data-cy-placementRequestId': item.id } },
      ),
    }
  }
  if ('person' in item && item.person) {
    return {
      html: linkTo(
        adminPaths.admin.placementRequests.show,
        { id: item.id },
        { text: item.person.name, attributes: { 'data-cy-placementRequestId': item.id } },
      ),
    }
  }
  return { html: '' }
}

export const releaseTypeCell = (task: PlacementRequestTask) => {
  return {
    text: allReleaseTypes[task.releaseType],
  }
}

export const dashboardTableHeader = (
  status: PlacementRequestStatus,
  sortBy: string,
  sortDirection: SortDirection,
  hrefPrefix: string,
): Array<TableCell> => {
  return [
    {
      text: 'Name',
    },
    {
      text: 'CRN',
    },
    {
      text: 'Tier',
    },
    sortHeader('Arrival date', 'expectedArrival', sortBy, sortDirection, hrefPrefix),
    status === 'matched'
      ? {
          text: 'Approved Premises',
        }
      : sortHeader('Length of stay', 'duration', sortBy, sortDirection, hrefPrefix),
    {
      text: 'Request type',
    },
  ]
}
