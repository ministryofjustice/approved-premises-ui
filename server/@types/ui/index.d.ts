import { RoshRisks, RiskTier, FlagsEnvelope, Mappa } from '@approved-premises-shared'

// A utility type that allows us to define an object with a date attribute split into
// date, month, year (and optionally, time) attributes. Designed for use with the GOV.UK
// date input
export type ObjectWithDateParts<K extends string | number> = { [P in `${K}-${'year' | 'month' | 'day'}`]: string } & {
  [P in `${K}-time`]?: string
} & {
  [P in K]?: string
}

export type BookingStatus = 'arrived' | 'awaiting-arrival' | 'not-arrived' | 'departed' | 'cancelled'

export type TaskNames = 'basic-information' | 'type-of-ap'

export interface HtmlAttributes {
  [key: string]: string
}

export interface TextItem {
  text: string
}

export interface HtmlItem {
  html: string
}

export type TableCell = { text: string; attributes?: HtmlAttributes } | { html: string }
export interface TableRow {
  [index: number]: TableCell
}

export interface RadioItems {
  text: string
  value: string
  checked?: boolean
}

export interface SelectOptions {
  text: string
  value: string
  selected?: boolean
}

export interface SummaryList {
  classes?: string
  attributes?: HtmlAttributes
  rows: Array<SummaryListItem>
}

export interface SummaryListActionItem {
  href: string
  text: string
  visuallyHiddenText: string
}

export interface SummaryListItem {
  key: TextItem | HtmlItem
  value: TextItem | HtmlItem
  actions?: { items: Array<SummaryListActionItem> }
}

export interface IdentityBarMenu {
  items: Array<IdentityBarMenuItem>
}

export interface IdentityBarMenuItem {
  classes: string
  href: string
  text: string
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High'

export type RiskEnvelopeStatus = 'retrieved' | 'not_found' | 'error'

export type TierNumber = '1' | '2' | '3' | '4'
export type TierLetter = 'A' | 'B' | 'C' | 'D'
export type RiskTierLevel = `${TierLetter}${TierNumber}`

export interface ErrorMessage {
  text: string
  attributes: {
    [K: string]: boolean
  }
}

export interface ErrorMessages {
  [K: string]: ErrorMessage
}

export interface ErrorSummary {
  text: string
  href: string
}

export interface ErrorsAndUserInput {
  errors: ErrorMessages
  errorSummary: Array<string>
  userInput: Record<string, unknown>
}

export type TaskListErrors = Array<{ propertyName: string; errorType: string }>

export type YesOrNo = 'yes' | 'no'

export type PersonStatus = 'InCustody' | 'InCommunity'

export interface ReferenceData {
  id: string
  name: string
  isActive: boolean
}

export interface PersonRisksUI {
  roshRisks: RoshRisks
  tier: RiskTier
  flags: FlagsEnvelope['value']
  mappa: Mappa
}

export type GroupedListofBookings = {
  [K in 'arrivingToday' | 'departingToday' | 'upcomingArrivals' | 'upcomingDepartures']: Array<TableRow>
}
