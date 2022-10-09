import { Axios } from 'axios';
import { AppContainer } from '../../../infra/register';
import { Settings } from '../../../infra/settings';
import { Logger } from '../../../infra/tools/logger';
import { ChargeStatusGetterInput, ChargeStatusGetterOutput } from './types';

export default class ChargeStatusGetter {
  private axios: Axios;
  private settings: Settings;
  private logger: Logger;

  constructor(params: AppContainer) {
    this.axios = params.resolve['axios'];
    this.settings = params.resolve['settings'];
    this.logger = params.resolve['logger'];
  }

  public async execute({ chargeId }: ChargeStatusGetterInput): Promise<ChargeStatusGetterOutput> {
    this.logger.info('Getting oauth token in API Pix');

    const oauthToken = await this.getOAuthToken();

    this.logger.info('Getting charge in API Pix');

    const gettedCharge = await this.getCharge(oauthToken, chargeId);

    this.logger.info('Assigning the current status');

    const currentStatus = this.getCurrentChargeStatus(gettedCharge);

    this.logger.info('Charge status getting finished');

    return {
      id: gettedCharge.txid,
      status: currentStatus
    };
  }

  private async getOAuthToken(): Promise<string> {
    try {
      const { data: tokenResponse } = await this.axios.request({
        method: 'POST',
        url: `${this.settings.apiPix.url}/oauth/token`,
        httpsAgent: this.settings.apiPix.httpsAgent,
        auth: {
          username: this.settings.apiPix.credentials.clientId,
          password: this.settings.apiPix.credentials.clientSecret
        },
        data: {
          grant_type: 'client_credentials'
        }
      });

      return tokenResponse.access_token;
    } catch (err: any) {
      this.logger.error('A unknown error occurred while getting oauth token', { errData: err.data });
      throw new Error('API Pix oauth token failed');
    }
  }

  private async getCharge(oauthToken: string, chargeId: string) {
    try {
      const { data: gettedCharge } = await this.axios.request({
        method: 'GET',
        url: `${this.settings.apiPix.url}/v2/cob/${chargeId}`,
        httpsAgent: this.settings.apiPix.httpsAgent,
        headers: {
          Authorization: `Bearer ${oauthToken}`
        }
      });

      return gettedCharge;
    } catch (err: any) {
      this.logger.error('A unknown error occurred while getting charge', { errData: err.data });
      throw new Error('API Pix charge getting failed');
    }
  }

  private getCurrentChargeStatus(gettedCharge: any): string {
    if (gettedCharge.status === 'ATIVA') {
      const creationDate = new Date(gettedCharge.calendario.criacao);
      const expirationDate = new Date(creationDate.getTime() + (gettedCharge.calendario.expiracao * 1000));

      if (new Date() > expirationDate) {
        return 'expired';
      } else {
        return 'active';
      }
    } else if (gettedCharge.status === 'CONCLUIDA') {
      return 'finished';
    } else {
      return 'removed';
    }
  }
}
