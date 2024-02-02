import { BedOccupancyEntryUi } from '@approved-premises/ui'
import {
  bedOccupancyEntryFactory,
  bedOccupancyRangeFactory,
  extendedPremisesSummaryFactory,
  premisesSummaryFactory,
} from '../testutils/factories'
import {
  groupedSelectOptions,
  mapApiOccupancyEntryToUiOccupancyEntry,
  mapApiOccupancyToUiOccupancy,
  overcapacityMessage,
  premisesTableRows,
  summaryListForPremises,
} from './premisesUtils'
import { addOverbookingsToSchedule } from './addOverbookingsToSchedule'
import { textValue } from './applications/utils'
import paths from '../paths/manage'
import { linkTo } from './utils'

jest.mock('./addOverbookingsToSchedule')

describe('premisesUtils', () => {
  describe('overcapacityMessage', () => {
    it('returns undefined when passed an empty array', () => {
      const result = overcapacityMessage([])
      expect(result).toEqual(undefined)
    })

    it('returns undefined when passed an array with no negative numbers for capacity', () => {
      const result = overcapacityMessage([
        { date: new Date(2022, 0, 1).toISOString(), availableBeds: 1 },
        { date: new Date(2022, 0, 2).toISOString(), availableBeds: 2 },
        { date: new Date(2022, 0, 3).toISOString(), availableBeds: 3 },
        { date: new Date(2022, 0, 4).toISOString(), availableBeds: 0 },
      ])
      expect(result).toEqual(undefined)
    })

    it('returns a header message if there is only one object with a negative number', () => {
      const dateCapacities = [
        { date: new Date(2022, 0, 1).toISOString(), availableBeds: -1 },
        { date: new Date(2022, 0, 2).toISOString(), availableBeds: 2 },
        { date: new Date(2022, 0, 3).toISOString(), availableBeds: 3 },
        { date: new Date(2022, 0, 4).toISOString(), availableBeds: 0 },
      ]
      const result = overcapacityMessage(dateCapacities)

      expect(result).toEqual(
        '<h3 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity on Saturday 1 January 2022</h3>',
      )
    })

    it('returns a header message with a range if there are multiple overcapacity dates', () => {
      const dateCapacities = [
        { date: new Date(2022, 0, 1).toISOString(), availableBeds: -1 },
        { date: new Date(2022, 0, 2).toISOString(), availableBeds: -2 },
        { date: new Date(2022, 0, 3).toISOString(), availableBeds: -3 },
        { date: new Date(2022, 0, 4).toISOString(), availableBeds: 0 },
      ]
      const result = overcapacityMessage(dateCapacities)

      expect(result).toEqual(
        '<h3 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity for the period Saturday 1 January 2022 to Monday 3 January 2022</h3>',
      )
    })

    it('returns a message with a list if there are multiple overcapacity ranges', () => {
      const dateCapacities = [
        { date: new Date(2022, 0, 1).toISOString(), availableBeds: -1 },
        { date: new Date(2022, 0, 2).toISOString(), availableBeds: -2 },
        { date: new Date(2022, 0, 3).toISOString(), availableBeds: 3 },
        { date: new Date(2022, 0, 4).toISOString(), availableBeds: -2 },
        { date: new Date(2022, 0, 5).toISOString(), availableBeds: -2 },
      ]

      const result = overcapacityMessage(dateCapacities)

      expect(result).toMatchStringIgnoringWhitespace(
        `
          <h3 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity for the periods:</h3>
          <ul class="govuk-list govuk-list--bullet">
            <li>Saturday 1 January 2022 to Sunday 2 January 2022</li>
            <li>Tuesday 4 January 2022 to Wednesday 5 January 2022</li>
          </ul>
        `,
      )
    })

    it('returns a message with a list if there is both a single overcapacity days and an overcapacity range', () => {
      const dateCapacities = [
        { date: new Date(2022, 0, 1).toISOString(), availableBeds: -1 },
        { date: new Date(2022, 0, 3).toISOString(), availableBeds: 3 },
        { date: new Date(2022, 0, 4).toISOString(), availableBeds: -2 },
        { date: new Date(2022, 0, 5).toISOString(), availableBeds: -2 },
      ]

      const result = overcapacityMessage(dateCapacities)

      expect(result).toMatchStringIgnoringWhitespace(
        `
          <h3 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity for the periods:</h3>
          <ul class="govuk-list govuk-list--bullet">
            <li>Saturday 1 January 2022</li>
            <li>Tuesday 4 January 2022 to Wednesday 5 January 2022</li>
          </ul>
        `,
      )
    })
  })

  describe('mapApiOccupancyToUiOccupancy', () => {
    it('converts dates from strings to dates objects and adds overbookings', async () => {
      ;(addOverbookingsToSchedule as jest.Mock).mockImplementation((schedule: Array<BedOccupancyEntryUi>) => {
        return schedule
      })
      const bedOccupancyEntry = bedOccupancyEntryFactory.build({ startDate: '2023-01-02', endDate: '2023-01-03' })
      const bedOccupancyRange = bedOccupancyRangeFactory.build({
        schedule: [bedOccupancyEntry],
      })

      const uiOccupancy = [
        {
          bedId: bedOccupancyRange.bedId,
          bedName: bedOccupancyRange.bedName,
          schedule: [
            {
              endDate: new Date(2023, 0, 3),
              length: bedOccupancyEntry.length,
              startDate: new Date(2023, 0, 2),
              type: bedOccupancyEntry.type,
            },
          ],
        },
      ]

      expect(await mapApiOccupancyToUiOccupancy([bedOccupancyRange])).toEqual(uiOccupancy)

      expect(addOverbookingsToSchedule).toHaveBeenCalledWith(uiOccupancy[0].schedule)
    })
  })

  describe('mapApiOccupancyEntryToUiOccupancyEntry', () => {
    it('converts dates from strings to dates objects', async () => {
      const bedOccupancyEntry = bedOccupancyEntryFactory.build({ startDate: '2023-01-02', endDate: '2023-01-03' })
      const bedOccupancyRange = bedOccupancyRangeFactory.build({
        schedule: [bedOccupancyEntry],
      })
      expect(await mapApiOccupancyEntryToUiOccupancyEntry(bedOccupancyRange)).toEqual({
        bedId: bedOccupancyRange.bedId,
        bedName: bedOccupancyRange.bedName,
        schedule: [
          {
            endDate: new Date(2023, 0, 3),
            length: bedOccupancyEntry.length,
            startDate: new Date(2023, 0, 2),
            type: bedOccupancyEntry.type,
          },
        ],
      })
    })
  })

  describe('summaryListForPremises', () => {
    it('should return a summary of a premises', () => {
      const premises = extendedPremisesSummaryFactory.build({
        apCode: '123',
        postcode: 'SW1A 1AA',
        bedCount: 20,
        availableBedsForToday: 12,
      })

      expect(summaryListForPremises(premises)).toEqual({
        rows: [
          {
            key: textValue('Code'),
            value: textValue('123'),
          },
          {
            key: textValue('Postcode'),
            value: textValue('SW1A 1AA'),
          },
          {
            key: textValue('Number of Beds'),
            value: textValue('20'),
          },
          {
            key: textValue('Available Beds'),
            value: textValue('12'),
          },
        ],
      })
    })
  })

  describe('groupedSelectOptions', () => {
    const area1Premises = premisesSummaryFactory.buildList(2, { apArea: 'Area 1' })
    const area2Premises = premisesSummaryFactory.buildList(2, { apArea: 'Area 2' })
    const premises = [...area1Premises, ...area2Premises]

    it('should group premises by region', () => {
      expect(groupedSelectOptions(premises, { premisesId: area1Premises[1].id })).toEqual([
        {
          items: [
            { selected: false, text: area1Premises[0].name, value: area1Premises[0].id },
            { selected: true, text: area1Premises[1].name, value: area1Premises[1].id },
          ],
          label: 'Area 1',
        },
        {
          items: [
            { selected: false, text: area2Premises[0].name, value: area2Premises[0].id },
            { selected: false, text: area2Premises[1].name, value: area2Premises[1].id },
          ],
          label: 'Area 2',
        },
      ])
    })

    it('should support a field name', () => {
      expect(groupedSelectOptions(premises, { premises: area2Premises[1].id }, 'premises')).toEqual([
        {
          items: [
            { selected: false, text: area1Premises[0].name, value: area1Premises[0].id },
            { selected: false, text: area1Premises[1].name, value: area1Premises[1].id },
          ],
          label: 'Area 1',
        },
        {
          items: [
            { selected: false, text: area2Premises[0].name, value: area2Premises[0].id },
            { selected: true, text: area2Premises[1].name, value: area2Premises[1].id },
          ],
          label: 'Area 2',
        },
      ])
    })
  })

  describe('premisesTableRows', () => {
    it('returns a table view of the premises', async () => {
      const premises1 = premisesSummaryFactory.build({ name: 'XYZ' })
      const premises2 = premisesSummaryFactory.build({ name: 'ABC' })
      const premises3 = premisesSummaryFactory.build({ name: 'GHI' })

      const premises = [premises1, premises2, premises3]

      expect(premisesTableRows(premises)).toEqual([
        [
          {
            text: premises2.name,
          },
          {
            text: premises2.apCode,
          },
          {
            text: premises2.bedCount.toString(),
          },
          {
            html: linkTo(
              paths.premises.show,
              { premisesId: premises2.id },
              { text: 'View', hiddenText: `about ${premises2.name}` },
            ),
          },
        ],
        [
          {
            text: premises3.name,
          },
          {
            text: premises3.apCode,
          },
          {
            text: premises3.bedCount.toString(),
          },
          {
            html: linkTo(
              paths.premises.show,
              { premisesId: premises3.id },
              { text: 'View', hiddenText: `about ${premises3.name}` },
            ),
          },
        ],
        [
          {
            text: premises1.name,
          },
          {
            text: premises1.apCode,
          },
          {
            text: premises1.bedCount.toString(),
          },
          {
            html: linkTo(
              paths.premises.show,
              { premisesId: premises1.id },
              { text: 'View', hiddenText: `about ${premises1.name}` },
            ),
          },
        ],
      ])
    })
  })
})
