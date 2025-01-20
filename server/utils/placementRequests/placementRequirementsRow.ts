import { PlacementRequest } from '../../@types/shared'
import { SummaryListItem } from '../../@types/ui'
import { sentenceCase } from '../utils'
import { requirementsHtmlString } from '../match'

export const placementRequirementsRow = (
  placementRequest: PlacementRequest,
  type: 'desirable' | 'essential',
): SummaryListItem => {
  const criteria = type === 'essential' ? placementRequest.essentialCriteria : placementRequest.desirableCriteria
  return {
    key: {
      text: `${sentenceCase(type)} Criteria`,
    },
    value: {
      html: requirementsHtmlString(criteria),
    },
  }
}
