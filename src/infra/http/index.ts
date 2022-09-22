import { AppContainer } from '../register';
import routes from './routes';

export default {
  start: async (container: AppContainer): Promise<void> => {
    const express = container.resolve['express'];
    const bodyParser = container.resolve['bodyParser'];
    const logger = container.resolve['logger'];

    const server = express();

    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: false }))

    routes(server, container);

    await new Promise((resolve) => {
      server.listen(8080, () => {
        logger.info('Server started', { port: 8080 });
        resolve({});
      });
    })
  }
}
