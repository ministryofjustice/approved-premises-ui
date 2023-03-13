import type { ApprovedPremisesApplication } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { SessionDataError } from '../../../../utils/errors'
import { retrieveQuestionResponseFromApplicationOrAssessment } from '../../../../utils/retrieveQuestionResponseFromApplicationOrAssessment'
import TasklistPage from '../../../tasklistPage'
import SentenceType, { SentenceTypesT } from './sentenceType'

const situations = {
  riskManagement: 'Application for risk management/public protection',
  residencyManagement: 'Residency management',
  bailAssessment: 'Bail assessment for residency requirement as part of a community order or suspended sentence order',
  bailSentence: 'Bail placement',
} as const

type CommunityOrderSituations = Pick<typeof situations, 'riskManagement' | 'residencyManagement'>
type BailPlacementSituations = Pick<typeof situations, 'bailAssessment' | 'bailSentence'>
type SentenceTypeResponse = Extract<SentenceTypesT, 'communityOrder' | 'bailPlacement'>

@Page({ name: 'situation', bodyProperties: ['situation'] })
export default class Situation implements TasklistPage {
  title = 'Which of the following options best describes the situation?'

  situations: CommunityOrderSituations | BailPlacementSituations

  constructor(
    readonly body: { situation?: keyof CommunityOrderSituations | keyof BailPlacementSituations },
    readonly application: ApprovedPremisesApplication,
  ) {
    const sessionSentenceType = retrieveQuestionResponseFromApplicationOrAssessment(application, SentenceType)

    this.situations = this.getSituationsForSentenceType(sessionSentenceType)
  }

  next() {
    return 'release-date'
  }

  previous() {
    return 'sentence-type'
  }

  response() {
    return { [`${this.title}`]: situations[this.body.situation] }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.situation) {
      errors.situation = 'You must choose a situation'
    }

    return errors
  }

  items() {
    return Object.keys(this.situations).map(key => {
      return {
        value: key,
        text: this.situations[key],
        checked: this.body.situation === key,
      }
    })
  }

  getSituationsForSentenceType(
    sessionSentenceType: SentenceTypeResponse,
  ): CommunityOrderSituations | BailPlacementSituations {
    if (sessionSentenceType === 'communityOrder') {
      return { riskManagement: situations.riskManagement, residencyManagement: situations.residencyManagement }
    }
    if (sessionSentenceType === 'bailPlacement') {
      return { bailAssessment: situations.bailAssessment, bailSentence: situations.bailSentence }
    }
    throw new SessionDataError(`Unknown sentence type ${sessionSentenceType}`)
  }
}
