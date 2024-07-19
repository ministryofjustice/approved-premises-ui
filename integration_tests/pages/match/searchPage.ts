import { BedSearchParametersUi, TextItem } from '@approved-premises/ui'
import { BedSearchResult, BedSearchResults, PlacementCriteria, PlacementRequestDetail } from '@approved-premises/api'
import Page from '../page'
import { uiObjectValue } from '../../helpers'
import { summaryCardRows } from '../../../server/utils/matchUtils'
import { placementCriteriaLabels } from '../../../server/utils/placementCriteriaUtils'
import paths from '../../../server/paths/match'
import { isFullPerson } from '../../../server/utils/personUtils'

export default class SearchPage extends Page {
  constructor(name: string) {
    super(name)
  }

  static visit(placementRequest: PlacementRequestDetail) {
    if (!isFullPerson(placementRequest.person))
      throw Error('This test requires a FullPerson attached to the PlacementRequestDetail to work')

    cy.visit(paths.v2Match.placementRequests.search.spaces({ id: placementRequest.id }))
    return new SearchPage(placementRequest.person.name)
  }

  shouldShowEssentialCriteria(criteria: Array<PlacementCriteria>) {
    criteria.forEach(c => {
      cy.get('span.moj-filter__tag').should('contain', placementCriteriaLabels[c])
    })
  }

  shouldHaveCriteriaSelected(criteria: Array<PlacementCriteria>) {
    cy.get('input:checked[type="checkbox"][name="requiredCharacteristics"]').should('have.length', criteria.length)

    criteria.forEach(c => {
      cy.get(`input[name="requiredCharacteristics"][value="${c}"]`).should('be.checked')
    })
  }

  shouldDisplaySearchResults(bedSearchResults: BedSearchResults, searchParams: BedSearchParametersUi): void {
    cy.get('h2').contains(`${bedSearchResults.resultsBedCount} Approved Premises found`)

    bedSearchResults.results.forEach(result => {
      cy.contains('div', result.premises.name)
        .parent('div')
        .within(() => {
          const tableRows = summaryCardRows(result, searchParams.requiredCharacteristics)
          tableRows.forEach(row => {
            cy.contains('dt', (row.key as TextItem).text)
              .parent('div')
              .within(() => {
                cy.get('dd').should('contain', uiObjectValue(row.value))
              })
          })
        })
    })
  }

  clickSearchResult(bedSearchResult: BedSearchResult): void {
    cy.get('a').contains(bedSearchResult.bed.name).click()
  }

  changeSearchParameters(newSearchParameters: BedSearchParametersUi): void {
    this.clearDateInputs('startDate')
    this.completeDateInputs('startDate', newSearchParameters.startDate)

    this.getTextInputByIdAndClear('durationDays')
    this.getTextInputByIdAndEnterDetails('durationDays', newSearchParameters.durationDays.toString())
    this.getTextInputByIdAndClear('durationWeeks')
    this.getTextInputByIdAndEnterDetails('durationWeeks', newSearchParameters.durationWeeks.toString())

    this.getTextInputByIdAndClear('postcodeDistrict')
    this.getTextInputByIdAndEnterDetails('postcodeDistrict', newSearchParameters.postcodeDistrict)
    this.getTextInputByIdAndClear('maxDistanceMiles')
    this.getTextInputByIdAndEnterDetails('maxDistanceMiles', newSearchParameters.maxDistanceMiles.toString())
    cy.get('[type="checkbox"]').uncheck()

    newSearchParameters.requiredCharacteristics.forEach(characteristic => {
      this.checkCheckboxByNameAndValue('requiredCharacteristics', characteristic)
    })
  }

  clickUnableToMatch(): void {
    cy.get('.govuk-button').contains('Unable to match').click()
  }
}
