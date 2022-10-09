import { NextFunction, Request, Response } from 'express';
import { AppContainer } from '../../../infra/register';
import PaymentReceiver from '../../../interactors/payments/receiver';
import { PaymentReceiverInput } from '../../../interactors/payments/receiver/types';

export default {
  receivePayment: async (req: Request, res: Response, next: NextFunction) => {
    const container: AppContainer = (<any>req).container;
    const paymentReceiver = new PaymentReceiver(container);

    const input: PaymentReceiverInput = req.body;

    try {
      await paymentReceiver.execute(input);

      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }
};
