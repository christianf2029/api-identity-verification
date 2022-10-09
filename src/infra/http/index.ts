import { AppContainer } from '../register';
import scope from './middlewares/scope';
import routes from './routes';

export default {
  start: async (container: AppContainer): Promise<void> => {
    const express = container.resolve['express'];
    const settings = container.resolve['settings'];
    const logger = container.resolve['logger'];

    const server = express();

    server.use(express.json());
    server.use(express.urlencoded({ extended: false }));
    server.use(scope(container));

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
