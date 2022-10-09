import { NextFunction, Request, Response } from 'express';
import { AppContainer } from '../../../infra/register';
import ChargeCreator from '../../../interactors/charges/creator';
import ChargeStatusGetter from '../../../interactors/charges/status-getter';
import { ChargeStatusGetterInput } from '../../../interactors/charges/status-getter/types';

export default {
  getNew: async (req: Request, res: Response, next: NextFunction) => {
    const container: AppContainer = (<any>req).container;
    const chargeCreator = new ChargeCreator(container);

    try {
      const output = await chargeCreator.execute();

      res.status(201).json(output);
    } catch (err: any) {
      next(err);
    }
  },

  getChargeStatus: async (req: Request, res: Response, next: NextFunction) => {
    const container: AppContainer = (<any>req).container;
    const chargeStatusGetter = new ChargeStatusGetter(container);

    const input: ChargeStatusGetterInput = {
      chargeId: req.params.id
    };

    try {
      const output = await chargeStatusGetter.execute(input);

      res.status(200).json(output);
    } catch (err: any) {
      next(err);
    }
  }
};
