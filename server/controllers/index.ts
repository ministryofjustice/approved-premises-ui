/* istanbul ignore file */

import { controllers as applyControllers } from './apply'
import { controllers as assessControllers } from './assess'
import { controllers as matchControllers } from './match'
import { controllers as manageControllers } from './manage'
import { controllers as adminControllers } from './admin'
import TasksController from './tasksController'
import AllocationsController from './tasks/allocationsController'

import type { Services } from '../services'
import DashboardController from './dashboardController'
import PagesController from './placementApplications/pagesController'
import ReviewController from './placementApplications/reviewController'
import WithdrawalsController from './placementApplications/withdrawalsController'
import RedirectController from './redirectController'

export const controllers = (services: Services) => {
  const redirectController = new RedirectController()
  const dashboardController = new DashboardController()
  const tasksController = new TasksController(
    services.taskService,
    services.applicationService,
    services.apAreaService,
    services.userService,
  )
  const allocationsController = new AllocationsController(services.taskService)
  const placementApplicationPagesController = new PagesController(
    services.placementApplicationService,
    services.applicationService,
  )
  const placementApplicationReviewController = new ReviewController(services.placementApplicationService)
  const placementApplicationWithdrawalsController = new WithdrawalsController(services.placementApplicationService)

  return {
    redirectController,
    dashboardController,
    tasksController,
    allocationsController,
    placementApplicationPagesController,
    placementApplicationReviewController,
    placementApplicationWithdrawalsController,
    ...applyControllers(services),
    ...assessControllers(services),
    ...matchControllers(services),
    ...manageControllers(services),
    ...adminControllers(services),
  }
}

export type Controllers = ReturnType<typeof controllers>
