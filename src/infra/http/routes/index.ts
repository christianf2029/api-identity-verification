import { AppContainer } from "../../register";
import { Express, Request, Response } from 'express';
import charges from "./charges";

export default (server: Express, container: AppContainer) => {
  charges(server, container);

  server.use('*', (req: Request, res: Response) => {
    container
      .resolve['logger']
      .warn('New request was received');

    res
      .status(404)
      .json({
        error: 'not_found',
        message: 'Not found'
      });
  });
}