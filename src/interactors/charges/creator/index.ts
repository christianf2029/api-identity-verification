import { Axios } from 'axios';
import { AppContainer } from '../../../infra/register';
import { Settings } from '../../../infra/settings';
import { Logger } from '../../../infra/tools/logger';
import { ChargeCreatorOutput } from './types';

export default class ChargeCreator {
  private axios: Axios;
  private settings: Settings;
  private logger: Logger;

  constructor(params: AppContainer) {
    this.axios = params.resolve['axios'];
    this.settings = params.resolve['settings'];
    this.logger = params.resolve['logger'];
  }

  public async execute(): Promise<ChargeCreatorOutput> {
    this.logger.info('Getting oauth token in API Pix');

    const oauthToken = await this.getOAuthToken();

    this.logger.info('Creating a new charge in API Pix');

    const createdCharge = await this.createCharge(oauthToken);

    this.logger.info('Generating QR Code in API Pix');

    const generatedQRCode = await this.generateQRCode(oauthToken, createdCharge);

    this.logger.info('Charge creation finished');

    return {
      id: createdCharge.txid,
      status: 'active',
      qrcodeImage: generatedQRCode.imagemQrcode,
      expiration: createdCharge.calendario.expiracao,
      createdAt: createdCharge.calendario.criacao
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

  private async createCharge(oauthToken: string) {
    try {
      const { data: createdCharge } = await this.axios.request({
        method: 'POST',
        url: `${this.settings.apiPix.url}/v2/cob`,
        httpsAgent: this.settings.apiPix.httpsAgent,
        headers: {
          Authorization: `Bearer ${oauthToken}`
        },
        data: {
          calendario: {
            expiracao: 60
          },
          devedor: {
            cpf: '12888645661',
            nome: 'Christian Teixeira'
          },
          valor: {
            original: '0.01'
          },
          chave: 'e39066bf-9148-4b26-a176-3fa9b092b79d',
          solicitacaoPagador: 'Efetue o Pix para validar a sua identidade, o valor será estornado logo após a confirmação.'
        }
      });

      return createdCharge;
    } catch (err: any) {
      this.logger.error('A unknown error occurred while creating charge', { errData: err.data });
      throw new Error('API Pix charge creation failed');
    }
  }

  private async generateQRCode(oauthToken: string, createdCharge: any) {
    try {
      const { data: generatedQRCode } = await this.axios.request({
        method: 'GET',
        url: `${this.settings.apiPix.url}/v2/loc/${createdCharge.loc.id}/qrcode`,
        httpsAgent: this.settings.apiPix.httpsAgent,
        headers: {
          Authorization: `Bearer ${oauthToken}`
        }
      });

      return generatedQRCode;
    } catch (err: any) {
      this.logger.error('A unknown error occurred while generating QR Code', { errData: err.data });
      throw new Error('API Pix qr code generation failed');
    }
  }
}
