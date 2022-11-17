import type { TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../tasklistPage'

export const sentenceTypes = {
  standardDeterminate: 'Standard determinate custody',
  life: 'Life sentence',
  ipp: 'Indeterminate Public Protection',
  extendedDeterminate: 'Extended determinate custody',
  communityOrder: 'Community Order',
  bailPlacement: 'Bail placement',
  nonStatutory: 'Non-statutory',
} as const

export type SentenceTypesT = keyof typeof sentenceTypes

export default class SentenceType implements TasklistPage {
  name = 'sentence-type'

  title = 'Which of the following best describes the sentence type?'

  body: { sentenceType: SentenceTypesT }

  constructor(body: Record<string, unknown>) {
    this.body = {
      sentenceType: body.sentenceType as SentenceTypesT,
    }
  }

  response() {
    return { [this.title]: sentenceTypes[this.body.sentenceType] }
  }

  previous() {
    return ''
  }

  next() {
    switch (this.body.sentenceType) {
      case 'standardDeterminate':
        return 'release-type'
      case 'communityOrder':
        return 'situation'
      case 'bailPlacement':
        return 'situation'
      case 'extendedDeterminate':
        return 'release-type'
      case 'ipp':
        return 'release-type'
      case 'nonStatutory':
        return 'release-type'
      case 'life':
        return 'release-type'
      default:
        throw new Error('The release type is invalid')
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.sentenceType) {
      errors.sentenceType = 'You must choose a sentence type'
    }

    return errors
  }

  items() {
    return Object.keys(sentenceTypes).map(key => {
      return {
        value: key,
        text: sentenceTypes[key],
        checked: this.body.sentenceType === key,
      }
    })
  }
}
