import { AppContainer } from "../../register";
import { Express, Request, Response } from 'express';

export default (server: Express, container: AppContainer) => {

  server.get('/charges/new', (req: Request, res: Response) => {
    container
      .resolve['logger']
      .info('Creating a new charge');

    res
      .status(201)
      .json({
        id: 1
      });
  });

}
