import { Express, Request, Response } from 'express';
import { AppContainer } from '../../register';
import charges from './charges';
import webhook from './webhook';

export default (server: Express, container: AppContainer) => {
  charges(server);
  webhook(server, container);

  server.all('*', (req: Request, res: Response) => {
    container.resolve['logger'].warn('New request was received');

    res.status(404).json({
      error: 'not_found',
      message: 'Not found',
    });
  });
};
