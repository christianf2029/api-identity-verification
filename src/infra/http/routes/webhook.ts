import { Express, Request, Response } from 'express';
import paymentsCtrlHttp from '../../../adapters/controllers/http/payments.ctrl.http';
import { AppContainer } from '../../register';

export default (server: Express, container: AppContainer) => {
  server.post('/webhook', (req: Request, res: Response) => {
    container.resolve['logger']
      .info('Received a notification test event to the webhook server');

    res.status(200).end();
  });

  server.post(
    '/webhook/pix',
    paymentsCtrlHttp.receivePayment
  );
};
