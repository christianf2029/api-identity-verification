import { Express, Request, Response } from 'express';
import { AppContainer } from '../../register';

export default (server: Express, container: AppContainer) => {
  server.post('/webhook/pix', (req: Request, res: Response) => {
    container.resolve['logger'].info('Received a new Pix');

    res.status(200);
  });
};
