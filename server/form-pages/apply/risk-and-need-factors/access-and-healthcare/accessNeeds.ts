import type { TaskListErrors, YesNoOrIDK, YesOrNo, YesOrNoWithDetail } from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '../../../../@types/shared'
import { convertKeyValuePairToCheckBoxItems, flattenCheckboxInput } from '../../../../utils/formUtils'
import { pascalCase, sentenceCase } from '../../../../utils/utils'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'

export const additionalNeeds = {
  mobility: 'Mobility needs',
  visualImpairment: 'Visual impairment',
  learningDisability: 'Learning disability',
  hearingImpairment: 'Hearing impairment',
  neurodivergentConditions: 'Neurodivergent conditions',
  healthcare: 'Healthcare',
  pregnancy: 'Pregnancy',
  other: 'Other',
  none: 'None of the above',
}

type AdditionalNeed = keyof typeof additionalNeeds

type AccessNeedsBody = {
  additionalNeeds: Array<AdditionalNeed> | AdditionalNeed
  careActAssessmentCompleted: YesNoOrIDK
  needsInterpreter: YesOrNo
  interpreterLanguage: string
} & YesOrNoWithDetail<'careAndSupportNeeds'> &
  YesOrNoWithDetail<'religiousOrCulturalNeeds'>

@Page({
  name: 'access-needs',
  bodyProperties: [
    'additionalNeeds',
    'religiousOrCulturalNeeds',
    'religiousOrCulturalNeedsDetail',
    'careAndSupportNeeds',
    'careAndSupportNeedsDetail',
    'careActAssessmentCompleted',
    'needsInterpreter',
    'interpreterLanguage',
  ],
})
export default class AccessNeeds implements TasklistPage {
  title = 'Access, cultural and healthcare needs'

  questions = {
    needs: {
      question: `Does ${this.application.person.name} have any of the following needs?`,
      hint: `For example, if ${this.application.person.name} has a visual impairment, uses a hearing aid or has an ADHD diagnosis.`,
    },
    religiousOrCulturalNeeds: {
      question: `Does ${this.application.person.name} have any religious or cultural needs?`,
      furtherDetails: `Details of religious or cultural needs`,
    },
    interpreter: {
      question: `Does ${this.application.person.name} need an interpreter?`,
      language: 'Which language is an interpreter needed for?',
    },
    careAndSupportNeeds: { question: 'Does this person have care and support needs?', hint: 'Provide details' },
    careActAssessmentCompleted: 'Has a care act assessment been completed?',
  }

  constructor(public body: Partial<AccessNeedsBody>, private readonly application: ApprovedPremisesApplication) {
    this.body.additionalNeeds = flattenCheckboxInput(body.additionalNeeds)
  }

  previous() {
    return 'dashboard'
  }

  next() {
    if (this.body.additionalNeeds.includes('mobility')) return 'access-needs-further-questions'
    return 'covid'
  }

  response() {
    const response = {
      [this.questions.needs.question]: (this.body.additionalNeeds as Array<AdditionalNeed>)
        .map((need, i) => (i < 1 ? additionalNeeds[need] : additionalNeeds[need].toLowerCase()))
        .join(', '),
      [this.questions.religiousOrCulturalNeeds.question]: yesOrNoResponseWithDetail(
        'religiousOrCulturalNeeds',
        this.body,
      ),
      [this.questions.careAndSupportNeeds.question]: yesOrNoResponseWithDetail('careAndSupportNeeds', this.body),
      [this.questions.interpreter.question]: sentenceCase(this.body.needsInterpreter),
      [this.questions.careActAssessmentCompleted]:
        this.body.careActAssessmentCompleted === 'yes' || this.body.careActAssessmentCompleted === 'no'
          ? pascalCase(this.body.careActAssessmentCompleted)
          : "I don't know",
    }
    if (this.body.needsInterpreter === 'yes') {
      return {
        ...response,
        [this.questions.interpreter.language]: this.body.interpreterLanguage,
      }
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.additionalNeeds || !this.body.additionalNeeds.length) {
      errors.additionalNeeds = `You must confirm whether ${this.application.person.name} has any additional needs`
    }
    if (!this.body.religiousOrCulturalNeeds) {
      errors.religiousOrCulturalNeeds = `You must confirm whether ${this.application.person.name} has any religious or cultural needs`
    }
    if (!this.body.careAndSupportNeeds) {
      errors.careAndSupportNeeds = `You must confirm whether ${this.application.person.name} has care and support needs`
    }
    if (this.body.careAndSupportNeeds === 'yes' && !this.body.careAndSupportNeedsDetail) {
      errors.careAndSupportNeedsDetail = `You must provide details of ${this.application.person.name}'s care and support needs`
    }
    if (!this.body.needsInterpreter) {
      errors.needsInterpreter = 'You must confirm the need for an interpreter'
    }
    if (!this.body.careActAssessmentCompleted) {
      errors.careActAssessmentCompleted = 'You must confirm whether a care act assessment has been completed'
    }

    return errors
  }

  needsCheckboxes() {
    return convertKeyValuePairToCheckBoxItems(additionalNeeds, this.body.additionalNeeds as Array<AdditionalNeed>)
  }
}
