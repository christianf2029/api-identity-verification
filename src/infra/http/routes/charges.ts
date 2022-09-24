import { Express, Request, Response } from 'express';
import { AppContainer } from '../../register';

export default (server: Express, container: AppContainer) => {
  server.get('/charges/new', (req: Request, res: Response) => {
    container.resolve['logger'].info('Creating a new charge');

    res.status(201).json({ id: 1 });
  });

  server.get('/charges/:id/status', (req: Request, res: Response) => {
    container.resolve['logger'].info('Getting the charge');

    res.status(200).json({ id: 1, status: 'active' });
  });
};
