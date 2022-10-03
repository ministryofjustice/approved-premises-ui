import type { ApplicationData } from 'approved-premises'
import paths from '../paths/approved-premises/apply'
import { taskLink, getTaskStatus } from './applicationUtils'

describe('applicationUtils', () => {
  describe('getTaskStatus', () => {
    it('returns a not started tag when the task is incomplete', () => {
      const application = {} as ApplicationData

      expect(getTaskStatus('basic-information', application)).toEqual(
        '<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="basic-information-status">Not started</strong>',
      )
    })

    it('returns a completed tag when the task is complete', () => {
      const application = { 'basic-information': { foo: 'bar' } } as ApplicationData

      expect(getTaskStatus('basic-information', application)).toEqual(
        '<strong class="govuk-tag app-task-list__tag" id="basic-information-status">Completed</strong>',
      )
    })
  })

  describe('taskLink', () => {
    it('should return a link to a task', () => {
      expect(taskLink('type-of-ap', 'some-uuid')).toEqual(
        `<a href="${paths.applications.pages.show({
          id: 'some-uuid',
          task: 'type-of-ap',
          page: 'ap-type',
        })}" aria-describedby="eligibility-type-of-ap" data-cy-task-name="type-of-ap">Type of Approved Premises required</a>`,
      )
    })
  })
})
