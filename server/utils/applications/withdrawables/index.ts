import { Booking, Withdrawable } from '../../../@types/shared'
import { RadioItem } from '../../../@types/ui'
import matchPaths from '../../../paths/match'
import managePaths from '../../../paths/manage'
import { DateFormats } from '../../dateUtils'
import { linkTo } from '../../utils'

export type SelectedWithdrawableType = 'application' | 'placementRequest' | 'placement'

export const withdrawableTypeRadioOptions = (
  withdrawables: Array<Withdrawable>,
  selectedItem?: SelectedWithdrawableType,
) => {
  const radioItems: Array<RadioItem> = []

  if (withdrawables.find(w => w.type === 'application')) {
    radioItems.push({
      text: 'Application',
      value: 'application',
      checked: selectedItem === 'application',
      hint: {
        text: `This will withdraw the application, assessment, and any related requests for placement and placements.`,
      },
    })
  }

  if (withdrawables.find(w => w.type === 'booking')) {
    radioItems.push({
      text: 'Placement',
      value: 'placement',
      checked: selectedItem === 'placement',
      hint: {
        text: 'This will withdraw a placement but retain the request for placement so that the person can be matched somewhere else.',
      },
    })
  }

  if (withdrawables.find(w => w.type === 'placement_application' || w.type === 'placement_request'))
    radioItems.push({
      text: 'Request for placement',
      value: 'placementRequest',
      checked: selectedItem === 'placementRequest',
      hint: { text: 'This will withdraw a request for placement and any related placements.' },
    })

  return radioItems
}

export const withdrawableRadioOptions = (
  withdrawables: Array<Withdrawable>,
  selectedWithdrawable?: Withdrawable['id'],
  bookings: Array<Booking> = [],
): Array<RadioItem> => {
  return withdrawables.map(withdrawable => {
    if (withdrawable.type === 'placement_application') {
      return {
        text: withdrawable.dates
          .map(datePeriod => DateFormats.formatDurationBetweenTwoDates(datePeriod.startDate, datePeriod.endDate))
          .join(', '),
        value: withdrawable.id,
        checked: selectedWithdrawable === withdrawable.id,
      }
    }
    if (withdrawable.type === 'placement_request') {
      return {
        text: withdrawable.dates
          .map(datePeriod => DateFormats.formatDurationBetweenTwoDates(datePeriod.startDate, datePeriod.endDate))
          .join(', '),
        value: withdrawable.id,
        checked: selectedWithdrawable === withdrawable.id,
        hint: {
          html: linkTo(
            matchPaths.placementRequests.show,
            { id: withdrawable.id },
            {
              text: 'See placement details (opens in a new tab)',
              attributes: { 'data-cy-withdrawable-id': withdrawable.id },
              openInNewTab: true,
            },
          ),
        },
      }
    }
    if (withdrawable.type === 'booking') {
      const booking = bookings.find(b => b.id === withdrawable.id)

      if (!booking) throw new Error(`Booking not found for withdrawable: ${withdrawable.id}`)

      return {
        text: `${booking.premises.name} - ${withdrawable.dates
          .map(datePeriod => DateFormats.formatDurationBetweenTwoDates(datePeriod.startDate, datePeriod.endDate))
          .join(', ')}`,
        value: withdrawable.id,
        checked: selectedWithdrawable === withdrawable.id,
        hint: {
          html: linkTo(
            managePaths.bookings.show,
            { premisesId: booking.premises.id, bookingId: booking.id },
            {
              text: 'See placement details (opens in a new tab)',
              attributes: { 'data-cy-withdrawable-id': withdrawable.id },
              openInNewTab: true,
            },
          ),
        },
      }
    }

    if (withdrawable.type === 'application') {
      return {
        text: 'Application',
        value: withdrawable.id,
        checked: selectedWithdrawable === withdrawable.id,
      }
    }

    throw new Error(`Unknown withdrawable type: ${withdrawable.type}`)
  })
}
