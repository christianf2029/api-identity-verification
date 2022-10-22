import { NextFunction, Request, Response } from 'express';
import { AppContainer } from '../../../infra/register';
import UsersListGetter from '../../../interactors/users/list-getter';
import UsersListStorer from '../../../interactors/users/list-storer';
import { UsersListStorerInput } from '../../../interactors/users/list-storer/types';

export default {
  storeList: async (req: Request, res: Response, next: NextFunction) => {
    const container: AppContainer = (<any>req).container;
    const usersListStorer = new UsersListStorer(container);

    const input: UsersListStorerInput = req.body;

    try {
      const users = await usersListStorer.execute(input);

      const output = users.map((user) => user.toJSON());
      res.status(201).json(output);
    } catch (err: any) {
      next(err);
    }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    const container: AppContainer = (<any>req).container;
    const usersListGetter = new UsersListGetter(container);

    try {
      const users = await usersListGetter.execute();

      const output = users.map((user) => user.toJSON());
      res.status(200).json(output);
    } catch (err: any) {
      next(err);
    }
  }
};
