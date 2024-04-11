import { ApprovedPremisesApplicationSummary as ApplicationSummary, Person } from '../../@types/shared'
import { isFullPerson, nameOrPlaceholderCopy, tierBadge } from '../personUtils'
import paths from '../../paths/apply'

export const createNameAnchorElement = (
  person: Person,
  applicationSummary: ApplicationSummary,
  { linkInProgressApplications }: { linkInProgressApplications: boolean } = { linkInProgressApplications: true },
) => {
  if (!linkInProgressApplications && applicationSummary.status === 'started') {
    return textValue(nameOrPlaceholderCopy(person, `LAO: ${person.crn}`))
  }

  return isFullPerson(person)
    ? htmlValue(
        `<a href=${paths.applications.show({ id: applicationSummary.id })} data-cy-id="${applicationSummary.id}">${
          person.name
        }</a>`,
      )
    : textValue(`LAO CRN: ${person.crn}`)
}

export const textValue = (value: string) => {
  return { text: value }
}

export const htmlValue = (value: string) => {
  return { html: value }
}

export const getTierOrBlank = (tier: string | null | undefined) => (tier ? tierBadge(tier) : '')
