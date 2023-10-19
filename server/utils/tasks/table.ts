import { Task } from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import paths from '../../paths/tasks'
import { DateFormats } from '../dateUtils'
import { nameCell } from '../tableUtils'
import { kebabCase, linkTo, sentenceCase } from '../utils'

const DUE_DATE_APPROACHING_DAYS_WINDOW = 3

const daysUntilDueCell = (task: Task): TableCell => ({
  html: formatDaysUntilDueWithWarning(task),
  attributes: {
    'data-sort-value': DateFormats.differenceInBusinessDays(DateFormats.isoToDateObj(task.dueDate), new Date()),
  },
})

const statusCell = (task: Task): TableCell => ({
  html: statusBadge(task),
})

const taskTypeCell = (task: Task): TableCell => ({
  html: `<strong class="govuk-tag">${sentenceCase(task.taskType)}</strong>`,
})

const allocationCell = (task: Task): TableCell => ({
  text: task.allocatedToStaffMember?.name,
})

const allocationLinkCell = (task: Task, action: 'Allocate' | 'Reallocate'): TableCell => {
  const hiddenText = `task for ${task.personName}`

  return {
    html: linkTo(
      paths.tasks.show,
      { id: task.id, taskType: kebabCase(task.taskType) },
      {
        text: action,
        hiddenText,
        attributes: { 'data-cy-taskId': task.id, 'data-cy-applicationId': task.applicationId },
      },
    ),
  }
}

const statusBadge = (task: Task): string => {
  switch (task.status) {
    case 'complete':
      return `<strong class="govuk-tag">${sentenceCase(task.status)}</strong>`
    case 'not_started':
      return `<strong class="govuk-tag govuk-tag--yellow">${sentenceCase(task.status)}</strong>`
    case 'in_progress':
      return `<strong class="govuk-tag govuk-tag--grey">${sentenceCase(task.status)}</strong>`
    default:
      return ''
  }
}

const formatDaysUntilDueWithWarning = (task: Task): string => {
  const differenceInDays = DateFormats.differenceInBusinessDays(DateFormats.isoToDateObj(task.dueDate), new Date())
  const formattedDifference = `${differenceInDays} Day${differenceInDays > 1 ? 's' : ''}`

  if (differenceInDays < DUE_DATE_APPROACHING_DAYS_WINDOW) {
    return `<strong class="task--index__warning">${
      differenceInDays < 0 ? '-' : ''
    }${formattedDifference}<span class="govuk-visually-hidden"> (Approaching due date)</span></strong>`
  }

  return formattedDifference
}

const allocatedTableRows = (tasks: Array<Task>): Array<TableRow> => {
  const rows: Array<TableRow> = []

  tasks.forEach(task => {
    rows.push([
      nameCell(task),
      daysUntilDueCell(task),
      allocationCell(task),
      statusCell(task),
      taskTypeCell(task),
      allocationLinkCell(task, 'Reallocate'),
    ])
  })

  return rows
}

const unallocatedTableRows = (tasks: Array<Task>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  tasks.forEach(task => {
    rows.push([
      nameCell(task),
      daysUntilDueCell(task),
      statusCell(task),
      taskTypeCell(task),
      allocationLinkCell(task, 'Allocate'),
    ])
  })

  return rows
}

export {
  allocatedTableRows,
  allocationLinkCell,
  formatDaysUntilDueWithWarning,
  daysUntilDueCell,
  statusCell,
  taskTypeCell,
  allocationCell,
  statusBadge,
  unallocatedTableRows,
}
