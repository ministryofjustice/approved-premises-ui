/* eslint-disable max-classes-per-file */
import type { TaskListErrors } from '@approved-premises-ui'

export class ValidationError extends Error {
  data: TaskListErrors

  constructor(data: TaskListErrors) {
    super('Validation error')
    this.data = data
  }
}

export class SessionDataError extends Error {}
export class UnknownPageError extends Error {}

export class TasklistAPIError extends Error {
  field: string

  constructor(message: string, field: string) {
    super(message)
    this.field = field
  }
}
