import Case from 'case'
import { Params, Path } from 'static-path'
import qs, { IStringifyOptions } from 'qs'

import type { PersonRisksUI, SummaryListItem } from '@approved-premises/ui'
import type { PersonRisks } from '@approved-premises/api'

import { DateFormats } from './dateUtils'

/* istanbul ignore next */
const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

/* istanbul ignore next */
const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

/**
 * Converts a string from any case to kebab-case
 * @param string string to be converted.
 * @returns name converted to kebab-case.
 */
export const kebabCase = (string: string) =>
  string
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()

/**
 * Converts a string from any case to camelCase
 * @param string string to be converted.
 * @returns name converted to camelCase.
 */
export const camelCase = (string: string) => Case.camel(string)

/**
 * Converts a string from any case to PascalCase
 * @param string string to be converted.
 * @returns name converted to PascalCase.
 */
export const pascalCase = (string: string) => camelCase(string).replace(/\w/, s => s.toUpperCase())

/**
 * Converts a string from any case to Sentence case
 * @param string string to be converted.
 * @returns name converted to sentence case.
 */
export const sentenceCase = (string: string) => Case.sentence(string)

export const lowerCase = (string: string) => Case.lower(string)

/**
 * Removes any items in an array of summary list items that are blank or undefined
 * @param items an array of summary list items
 * @returns all items with non-blank values
 */
export const removeBlankSummaryListItems = (items: Array<SummaryListItem>): Array<SummaryListItem> => {
  return items.filter(item => {
    if ('html' in item.value) {
      return item.value.html
    }
    if ('text' in item.value) {
      return item.value.text
    }
    return false
  })
}

export const mapApiPersonRisksForUi = (risks: PersonRisks): PersonRisksUI => {
  return {
    ...risks,
    roshRisks: {
      ...risks.roshRisks?.value,
      lastUpdated: risks.roshRisks?.value?.lastUpdated
        ? DateFormats.isoDateToUIDate(risks.roshRisks.value.lastUpdated)
        : '',
    },
    mappa: {
      ...risks.mappa?.value,
      lastUpdated: risks.mappa?.value?.lastUpdated ? DateFormats.isoDateToUIDate(risks.mappa.value.lastUpdated) : '',
    },
    tier: {
      ...risks.tier?.value,
      lastUpdated: risks.tier?.value?.lastUpdated ? DateFormats.isoDateToUIDate(risks.tier.value.lastUpdated) : '',
    },
    flags: risks.flags.value,
  }
}

export const linkTo = <Pattern extends `/${string}`>(
  path: Path<Pattern>,
  params: Params<Pattern>,
  {
    text,
    attributes = {},
    hiddenText = '',
  }: {
    text: string
    params?: Params<Pattern>
    attributes?: Record<string, string>
    hiddenText?: string
  },
): string => {
  let linkBody = text

  if (hiddenText) {
    linkBody = `${linkBody} <span class="govuk-visually-hidden">${hiddenText}</span>`
  }

  const attrBody = Object.keys(attributes)
    .map(a => `${a}="${attributes[a]}"`)
    .join(' ')

  return `<a href="${path(params)}" ${attrBody}>${linkBody}</a>`
}

/**
 * Returns a value from an object when given a path, the path can be in dot notation or array notation
 * @param object object to find property in
 * @param path path to property
 * @param defaultValue value to return if property is not found
 * @returns the property value or the default value
 */
export const resolvePath = (object: Record<string, unknown>, path: string) =>
  path
    .split(/[.[\]'"]/)
    .filter(p => Boolean(p))
    .reduce((acc, curr) => (acc ? acc[curr] : undefined), object)

export const createQueryString = (
  params: Record<string, unknown> | string,
  options: IStringifyOptions = { encode: false, indices: false },
): string => {
  return qs.stringify(params, options)
}
