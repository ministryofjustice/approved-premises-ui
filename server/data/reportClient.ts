import type { Response } from 'express'

import RestClient from './restClient'
import config, { ApiConfig } from '../config'

import paths from '../paths/api'
import { createQueryString } from '../utils/utils'
import { ReportType } from '../utils/reportUtils'

export default class ReportClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('reportClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async getReport(reportName: ReportType, month: string, year: string, response: Response): Promise<void> {
    const filename = `${reportName}-${year}-${month.padStart(2, '0')}.xlsx`
    response.set('Content-Disposition', `attachment; filename="${filename}"`)

    await this.restClient.pipe(
      {
        path: paths.reports({ reportName }),
        query: createQueryString({ month, year }),
      },
      response,
    )
  }
}
