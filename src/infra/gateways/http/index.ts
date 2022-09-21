import { AppContainer } from "../../register";

export default {
  start: async (container: AppContainer): Promise<void> => {
    const express = container.resolve['express'];
    const logger = container.resolve['logger'];

    const server = express();

    server.get('/*', (req, res) => {
      logger.debug('New request was received');

      res.send('Hello Word!').status(200);
    });

    await new Promise((resolve) => {
      server.listen(8080, () => {
        logger.info('Server started', { port: 8080 });
        resolve({});
      });
    })
  }
}
