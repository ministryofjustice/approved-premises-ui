/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
/* istanbul ignore file */

import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'
import BookingClient from './bookingClient'

initialiseAppInsights()
buildAppInsightsClient()

import HmppsAuthClient from './hmppsAuthClient'
import PremisesClient from './premisesClient'
import ReferenceDataClient from './referenceDataClient'
import PersonClient from './personClient'
import UserClient from './userClient'

import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'
import LostBedClient from './lostBedClient'
import ApplicationClient from './applicationClient'
import AssessmentClient from './assessmentClient'
import TaskClient from './taskClient'
import PlacementRequestClient from './placementRequestClient'
import BedClient from './bedClient'

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient())),
  approvedPremisesClientBuilder: ((token: string) => new PremisesClient(token)) as RestClientBuilder<PremisesClient>,
  bookingClientBuilder: ((token: string) => new BookingClient(token)) as RestClientBuilder<BookingClient>,
  referenceDataClientBuilder: ((token: string) =>
    new ReferenceDataClient(token)) as RestClientBuilder<ReferenceDataClient>,
  lostBedClientBuilder: ((token: string) => new LostBedClient(token)) as RestClientBuilder<LostBedClient>,
  personClient: ((token: string) => new PersonClient(token)) as RestClientBuilder<PersonClient>,
  applicationClientBuilder: ((token: string) => new ApplicationClient(token)) as RestClientBuilder<ApplicationClient>,
  assessmentClientBuilder: ((token: string) => new AssessmentClient(token)) as RestClientBuilder<AssessmentClient>,
  userClientBuilder: ((token: string) => new UserClient(token)) as RestClientBuilder<UserClient>,
  taskClientBuilder: ((token: string) => new TaskClient(token)) as RestClientBuilder<TaskClient>,
  placementRequestClientBuilder: ((token: string) =>
    new PlacementRequestClient(token)) as RestClientBuilder<PlacementRequestClient>,
  bedClientBuilder: ((token: string) => new BedClient(token)) as RestClientBuilder<BedClient>,
})

export type DataAccess = ReturnType<typeof dataAccess>

export {
  BedClient,
  BookingClient,
  PremisesClient,
  HmppsAuthClient,
  RestClientBuilder,
  ReferenceDataClient,
  LostBedClient,
  PersonClient,
  ApplicationClient,
  AssessmentClient,
  UserClient,
  TaskClient,
  PlacementRequestClient,
}
