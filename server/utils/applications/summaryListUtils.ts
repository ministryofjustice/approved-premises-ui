import {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
} from '@approved-premises/api'
import { HtmlItem, SummaryListItem, TextItem, UiTask } from '@approved-premises/ui'

import applyPaths from '../../paths/apply'
import assessPaths from '../../paths/assess'

import { getResponseForPage } from './utils'
import reviewSections from '../reviewUtils'
import isAssessment from '../assessments/isAssessment'
import { documentsFromApplication } from '../assessments/documentUtils'
import { getActionsForTaskId } from '../assessments/getActionsForTaskId'

const summaryListSections = (application: Application, showActions = true) =>
  reviewSections(application, taskResponsesAsSummaryListItems, showActions)

const taskResponsesAsSummaryListItems = (
  task: UiTask,
  applicationOrAssessment: Application | Assessment,
  showActions = true,
): Array<SummaryListItem> => {
  const items: Array<SummaryListItem> = []

  if (!applicationOrAssessment.data[task.id]) {
    return items
  }

  const pageNames = Object.keys(applicationOrAssessment.data[task.id])

  pageNames.forEach(pageName => {
    if (pageName === 'attach-documents') {
      items.push(
        ...attachDocumentsSummaryListItems(applicationOrAssessment as Application, task, pageName, showActions),
      )
      return
    }
    const response = getResponseForPage(applicationOrAssessment, task.id, pageName)

    Object.keys(response).forEach(key => {
      const value =
        typeof response[key] === 'string' || response[key] instanceof String
          ? ({ text: response[key] } as TextItem)
          : ({ html: embeddedSummaryListItem(response[key] as Array<Record<string, unknown>>) } as HtmlItem)

      items.push(summaryListItemForResponse(key, value, task, pageName, applicationOrAssessment, showActions))
    })
  })

  return items
}

const attachDocumentsSummaryListItems = (
  application: Application,
  task: UiTask,
  pageName: string,
  showActions: boolean,
) => {
  const items: Array<SummaryListItem> = []

  documentsFromApplication(application).forEach(document => {
    const item: SummaryListItem = {
      key: {
        html: `<a href="/applications/people/${application.person.crn}/documents/${document.id}" data-cy-documentId="${document.id}">${document.fileName}</a>`,
      },
      value: { text: document?.description || '' },
    }
    if (showActions) {
      item.actions = {
        items: [
          {
            href: applyPaths.applications.pages.show({ task: task.id, page: pageName, id: application.id }),
            text: 'Change',
            visuallyHiddenText: document.fileName,
          },
        ],
      }
    }
    items.push(item)
  })

  return items
}

const assessmentSections = (assessment: Assessment, showActions = true) => {
  return reviewSections(assessment, taskResponsesAsSummaryListItems, showActions)
}

const reviewApplicationSections = (application: Application, assessmentId: string) => {
  const cardActionFunction = (taskId: string) => getActionsForTaskId(taskId, assessmentId)

  return reviewSections(application, taskResponsesAsSummaryListItems, false, cardActionFunction)
}

const embeddedSummaryListItem = (answers: Array<Record<string, unknown>>): string => {
  let response = ''

  answers.forEach(answer => {
    response += '<dl class="govuk-summary-list govuk-summary-list--embedded">'
    Object.keys(answer).forEach(key => {
      response += `
      <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
        <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
          ${key}
        </dt>
        <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
        ${answer[key]}
        </dd>
      </div>
      `
    })
    response += '</dl>'
  })

  return response
}

const summaryListItemForResponse = (
  key: string,
  value: TextItem | HtmlItem,
  task: UiTask,
  pageName: string,
  applicationOrAssessment: Application | Assessment,
  showActions: boolean,
): SummaryListItem => {
  const item = {
    key: {
      text: key,
    },
    value,
  } as SummaryListItem

  if (showActions) {
    item.actions = {
      items: [
        {
          href: isAssessment(applicationOrAssessment)
            ? assessPaths.assessments.pages.show({ task: task.id, page: pageName, id: applicationOrAssessment.id })
            : applyPaths.applications.pages.show({ task: task.id, page: pageName, id: applicationOrAssessment.id }),
          text: 'Change',
          visuallyHiddenText: key,
        },
      ],
    }
  }

  return item
}

export {
  assessmentSections,
  summaryListSections,
  embeddedSummaryListItem,
  taskResponsesAsSummaryListItems,
  reviewApplicationSections,
}
