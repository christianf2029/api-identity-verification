import { NextFunction, Request, Response } from 'express';
import { AppContainer } from '../../../infra/register';
import PaymentNotificationReceiver from '../../../interactors/payments/notification-receiver';
import { PaymentNotificationReceiverInput } from '../../../interactors/payments/notification-receiver/types';

export default {
  receivePaymentNotification: async (req: Request, res: Response, next: NextFunction) => {
    const container: AppContainer = (<any>req).container;
    const paymentNotificationReceiver = new PaymentNotificationReceiver(container);

    const input: PaymentNotificationReceiverInput = req.body;

    try {
      await paymentNotificationReceiver.execute(input);

      res.status(204).end();
    } catch (err: any) {
      next(err);
    }
  }
};
