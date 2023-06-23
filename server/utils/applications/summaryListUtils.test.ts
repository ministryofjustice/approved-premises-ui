import { createMock } from '@golevelup/ts-jest'
import { applicationFactory, assessmentFactory, documentFactory } from '../../testutils/factories'
import { forPagesInTask } from './forPagesInTask'
import {
  embeddedSummaryListItem,
  reviewApplicationSections,
  summaryListSections,
  taskResponsesAsSummaryListItems,
} from './summaryListUtils'
import reviewSections from '../reviewUtils'
import { documentsFromApplication } from '../assessments/documentUtils'
import { getActionsForTaskId } from '../assessments/getActionsForTaskId'
import { getResponseForPage } from './getResponseForPage'
import TasklistPage from '../../form-pages/tasklistPage'

jest.mock('../reviewUtils')
jest.mock('./utils')
jest.mock('./getResponseForPage')
jest.mock('./forPagesInTask')
jest.mock('../assessments/documentUtils')
jest.mock('../assessments/getActionsForTaskId')

describe('summaryListUtils', () => {
  describe('embeddedSummaryListItem', () => {
    it('returns a summary list for an array of records', () => {
      const result = embeddedSummaryListItem([
        { foo: 'bar', bar: 'baz' },
        { foo: 'bar', bar: 'baz' },
      ]).replace(/\s+/g, ``)

      expect(result).toEqual(
        `
      <dl class="govuk-summary-list govuk-summary-list--embedded">
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            foo
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            bar
          </dd>
        </div>
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            bar
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            baz
          </dd>
        </div>
      </dl>

      <dl class="govuk-summary-list govuk-summary-list--embedded">
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            foo
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            bar
          </dd>
        </div>
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            bar
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            baz
          </dd>
        </div>
      </dl>`.replace(/\s+/g, ``),
      )
    })
  })

  describe('taskResponsesAsSummaryListItems', () => {
    it('calls reviewSections with the correct arguments', () => {
      const application = applicationFactory.build()

      summaryListSections(application)

      expect(reviewSections).toHaveBeenCalledWith(application, taskResponsesAsSummaryListItems, true)
    })

    it('calls reviewSections with showActions if added', () => {
      const application = applicationFactory.build()

      summaryListSections(application, false)

      expect(reviewSections).toHaveBeenCalledWith(application, taskResponsesAsSummaryListItems, false)
    })

    it('returns an empty array if there isnt any responses for the task', () => {
      const application = applicationFactory.build()

      expect(taskResponsesAsSummaryListItems({ id: '42', title: '42', pages: {} }, application, true)).toEqual([])
    })

    describe('when the document is an application', () => {
      it('returns the task responses as Summary List items and adds the actions object with a link to the application', () => {
        const application = applicationFactory.build()
        ;(forPagesInTask as jest.MockedFunction<typeof forPagesInTask>).mockImplementation((_1, _2, callback) => {
          const page = createMock<TasklistPage>()

          page.response.mockReturnValue({
            'A question': 'An answer',
          })

          callback(page, 'some-page')
        })
        application.data = { foo: ['bar'] }
        ;(getResponseForPage as jest.Mock).mockImplementation(() => ({
          title: 'response',
        }))

        expect(taskResponsesAsSummaryListItems({ id: 'foo', title: 'bar', pages: {} }, application, true)).toEqual([
          {
            actions: {
              items: [
                {
                  href: `/applications/${application.id}/tasks/foo/pages/some-page`,
                  text: 'Change',
                  visuallyHiddenText: 'title',
                },
              ],
            },
            key: {
              text: 'title',
            },
            value: {
              text: 'response',
            },
          },
        ])
      })
    })

    describe('when the document is an assessment', () => {
      it('returns the task responses as Summary List items and adds the actions object with a link to the application', () => {
        const assessment = assessmentFactory.build()
        assessment.data = { foo: ['bar'] }
        ;(forPagesInTask as jest.MockedFunction<typeof forPagesInTask>).mockImplementation((_1, _2, callback) => {
          const page = createMock<TasklistPage>()

          page.response.mockReturnValue({
            'A question': 'An answer',
          })

          callback(page, 'some-page')
        })
        ;(getResponseForPage as jest.Mock).mockImplementation(() => ({
          title: 'response',
        }))

        expect(taskResponsesAsSummaryListItems({ id: 'foo', title: 'bar', pages: {} }, assessment, true)).toEqual([
          {
            actions: {
              items: [
                {
                  href: `/assessments/${assessment.id}/tasks/foo/pages/some-page`,
                  text: 'Change',
                  visuallyHiddenText: 'title',
                },
              ],
            },
            key: {
              text: 'title',
            },
            value: {
              text: 'response',
            },
          },
        ])
      })
    })

    it('returns the task responses as Summary List items without the actions object if showActions is false', () => {
      const application = applicationFactory.build()
      application.data = { foo: ['bar'] }
      ;(getResponseForPage as jest.Mock).mockImplementation(() => ({
        title: 'response',
      }))

      expect(taskResponsesAsSummaryListItems({ id: 'foo', title: 'bar', pages: {} }, application, false)).toEqual([
        {
          key: {
            text: 'title',
          },
          value: {
            text: 'response',
          },
        },
      ])
    })

    describe('if the page name includes "attach-documents"', () => {
      it('then the correct array is returned', () => {
        const application = applicationFactory.build()
        const documents = documentFactory.buildList(1)

        ;(forPagesInTask as jest.MockedFunction<typeof forPagesInTask>).mockImplementation((_1, _2, callback) => {
          const page = createMock<TasklistPage>()

          page.response.mockReturnValue({
            'A question': 'An answer',
          })

          callback(page, 'attach-documents')
        })
        ;(documentsFromApplication as jest.Mock).mockReturnValue(documents)

        application.data['attach-required-documents'] = {
          'attach-documents': {
            selectedDocuments: documents,
          },
        }

        expect(
          taskResponsesAsSummaryListItems({ id: 'attach-required-documents', title: 'bar', pages: {} }, application),
        ).toEqual([
          {
            key: {
              html: `<a href="/applications/people/${application.person.crn}/documents/${documents[0].id}" data-cy-documentId="${documents[0].id}">${documents[0].fileName}</a>`,
            },
            value: {
              text: documents[0].description,
            },

            actions: {
              items: [
                {
                  href: `/applications/${application.id}/tasks/attach-required-documents/pages/attach-documents`,
                  text: 'Change',
                  visuallyHiddenText: documents[0].fileName,
                },
              ],
            },
          },
        ])
      })
    })
  })

  describe('reviewApplicationSections', () => {
    it('sends a cardActionFunction to reviewSections, which passes the correct assessment ID on to `getActionsForTaskId`', () => {
      const application = applicationFactory.build()

      reviewApplicationSections(application, 'assessmentId')

      const { mock } = reviewSections as jest.Mock
      const cardActionFunction = mock.calls[2][3]

      cardActionFunction('task')

      expect(getActionsForTaskId).toHaveBeenCalledWith('task', 'assessmentId')
    })
  })
})
