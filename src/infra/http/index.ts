import { AppContainer } from '../register';
import routes from './routes';

export default {
  start: async (container: AppContainer): Promise<void> => {
    const express = container.resolve['express'];
    const bodyParser = container.resolve['bodyParser'];
    const settings = container.resolve['settings'];
    const logger = container.resolve['logger'];

    const server = express();

    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: false }));

    routes(server, container);

    await new Promise(resolve => {
      server.listen(settings.httpServer.port, () => {
        logger.info('Http Server started', {
          port: settings.httpServer.port,
        });

        resolve(1);
      });
    });
  },
};
