import type { Premises } from 'approved-premises'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class PremisesClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('welcomeClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async getAllPremises(): Promise<Array<Premises>> {
    return (await this.restClient.get({ path: '/premises' })) as Array<Premises>
  }
}
