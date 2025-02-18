import { ApType } from '../@types/shared'

export const apTypeLabels: Record<ApType, string> = {
  normal: 'Standard (all AP types)',
  pipe: 'Psychologically Informed Planned Environment (PIPE)',
  esap: 'Enhanced Security AP (ESAP)',
  rfap: 'Recovery Focused AP (RFAP)',
  mhapElliottHouse: 'Specialist Mental Health AP (Elliott House, Midlands)',
  mhapStJosephs: 'Specialist Mental Health AP (St Josephs, Greater Manchester)',
} as const

export type ApTypeLabel = (typeof apTypeLabels)[ApType]
