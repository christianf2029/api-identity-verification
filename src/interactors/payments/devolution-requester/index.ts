import { Axios } from 'axios';
import { AppContainer } from '../../../infra/register';
import { Settings } from '../../../infra/settings';
import { Logger } from '../../../infra/tools/logger';
import { DevolutionRequesterInput, DevolutionRequesterOutput } from './types';

export default class DevolutionRequester {
  private axios: Axios;
  private settings: Settings;
  private logger: Logger;

  constructor(params: AppContainer) {
    this.axios = params.resolve['axios'];
    this.settings = params.resolve['settings'];
    this.logger = params.resolve['logger'];
  }

  public async execute(input: DevolutionRequesterInput): Promise<DevolutionRequesterOutput> {
    this.logger.info('Getting oauth token in the API Pix Gerencianet');

    const oauthToken = await this.getOAuthToken();

    this.logger.info('Requesting pix devolution');

    const requestedDevolution = await this.requestDevolution(oauthToken, input.endToEndId, input.value);

    this.logger.info('Devolution requested', { requestedDevolution });
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

  private async requestDevolution(oauthToken: string, endToEndId: string, value: string) {
    try {
      const { data: requestedDevolution } = await this.axios.request({
        method: 'PUT',
        url: `${this.settings.apiPix.url}/v2/pix/${endToEndId}/devolucao/1`,
        httpsAgent: this.settings.apiPix.httpsAgent,
        headers: {
          Authorization: `Bearer ${oauthToken}`
        },
        data: {
          'valor': value
        }
      });

      return requestedDevolution;
    } catch (err: any) {
      this.logger.error('A unknown error occurred while requesting devolution', { errData: err.data });
      throw new Error('API Pix requesting devolution failed');
    }
  }
}
