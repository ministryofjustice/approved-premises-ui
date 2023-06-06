import { applicationFactory } from '../../testutils/factories'
import { retrieveQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import { getDefaultPlacementDurationInWeeks } from './getDefaultPlacementDurationInWeeks'

jest.mock('../retrieveQuestionResponseFromFormArtifact.ts')

describe('getDefaultPlacementDurationInWeeks', () => {
  const application = applicationFactory.build()

  it('returns 12 weeks if the ap type is standard', () => {
    ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce('standard')

    expect(getDefaultPlacementDurationInWeeks(application)).toEqual(12)
  })

  it('returns 26 weeks if the ap type is standard', () => {
    ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce('pipe')

    expect(getDefaultPlacementDurationInWeeks(application)).toEqual(26)
  })

  it('returns 56 weeks if the ap type is standard', () => {
    ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce('esap')

    expect(getDefaultPlacementDurationInWeeks(application)).toEqual(56)
  })
})
