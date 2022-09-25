import { Express, Request, Response } from 'express';
import { AppContainer } from '../../register';

const apiPixTokenGetter = async (container: AppContainer) => {
  const axios = container.resolve['axios'];
  const settings = container.resolve['settings'];
  const logger = container.resolve['logger'];

  try {
    const response = await axios.post(`${settings.apiPix.url}/oauth/token`, {
      grant_type: 'client_credentials'
    }, {
      auth: {
        username: settings.apiPix.credentials.clientId,
        password: settings.apiPix.credentials.clientSecret
      },
      httpsAgent: settings.apiPix.httpsAgent
    });

    return response.data.access_token;
  } catch (err: any) {
    logger.error('A unknown error occurred while getting API Pix Oauth Token', { err });
    throw err;
  }
};

export default (server: Express, container: AppContainer) => {
  server.get('/charges/new', async (req: Request, res: Response) => {
    const axios = container.resolve['axios'];
    const settings = container.resolve['settings'];
    const logger = container.resolve['logger'];

    logger.info('Getting oauth token in the API Pix');

    const token = await apiPixTokenGetter(container);

    logger.info('Creating a new charge');

    const { data: createdCharge } = await axios.post(`${settings.apiPix.url}/v2/cob`, {
      calendario: {
        expiracao: 15
      },
      devedor: {
        cpf: '81332892540',
        nome: 'Christian Teixeira'
      },
      valor: {
        original: '0.01'
      },
      chave: 'e39066bf-9148-4b26-a176-3fa9b092b79d',
      solicitacaoPagador: 'Efetue o Pix para validar a sua identidade, o valor será estornado logo após a confirmação.'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      httpsAgent: settings.apiPix.httpsAgent
    });

    logger.info('Generating QR Code from the created charge');

    const { data: generatedQRCode } = await axios.get(`${settings.apiPix.url}/v2/loc/${createdCharge.loc.id}/qrcode`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      httpsAgent: settings.apiPix.httpsAgent
    });

    logger.info('Charge and QR Code all right, responding');

    res.status(201).json({
      id: createdCharge.txid,
      status: 'active',
      qrcodeImage: generatedQRCode.imagemQrcode,
      expiration: createdCharge.calendario.expiracao,
      createdAt: createdCharge.calendario.criacao
    });
  });

  server.get('/charges/:id/status', async (req: Request, res: Response) => {
    const axios = container.resolve['axios'];
    const settings = container.resolve['settings'];
    const logger = container.resolve['logger'];

    logger.info('Getting oauth token in the API Pix');

    const token = await apiPixTokenGetter(container);

    logger.info('Getting the charge');

    const { data: gettedCharge } = await axios.get(`${settings.apiPix.url}/v2/cob/${req.params.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      httpsAgent: settings.apiPix.httpsAgent
    });

    logger.info('Assigning the final status');

    let finalStatus: string;

    if (gettedCharge.status === 'ATIVA') {
      const creationDate = new Date(gettedCharge.calendario.criacao);
      const expirationDate = new Date(creationDate.getTime() + (gettedCharge.calendario.expiracao * 1000));

      if (new Date() > expirationDate) {
        finalStatus = 'expired';
      } else {
        finalStatus = 'active';
      }
    } else if (gettedCharge.status === 'CONCLUIDA') {
      finalStatus = 'finished';
    } else {
      finalStatus = 'removed';
    }

    logger.info('Charge status getted, responding');

    res.status(200).json({
      id: gettedCharge.txid,
      status: finalStatus
    });
  });
};
