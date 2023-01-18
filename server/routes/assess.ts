/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import Assess from '../form-pages/assess'
import paths from '../paths/assess'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { pages } = Assess
  const { get, put, post } = actions(router)
  const { assessmentsController, assessmentPagesController, clarificationNotesController } = controllers

  get(paths.assessments.index.pattern, assessmentsController.index())
  get(paths.assessments.show.pattern, assessmentsController.show())

  post(paths.assessments.clarificationNotes.create.pattern, clarificationNotesController.create())
  get(paths.assessments.clarificationNotes.confirm.pattern, clarificationNotesController.confirm())

  Object.keys(pages).forEach((taskKey: string) => {
    Object.keys(pages[taskKey]).forEach((pageKey: string) => {
      const { pattern } = paths.assessments.show.path(`tasks/${taskKey}/pages/${pageKey}`)

      get(pattern, assessmentPagesController.show(taskKey, pageKey))
      put(pattern, assessmentPagesController.update(taskKey, pageKey))
    })
  })

  return router
}
