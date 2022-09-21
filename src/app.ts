import databases from './infra/databases';
import server from './infra/gateways/http';
import poller from './infra/gateways/poller';
import register from './infra/register';
import settings from './infra/settings';
import logging from './infra/tools/logger';

const main = async (): Promise<void> => {
  const logger = logging.load()
  const container = register.load();

  const stts = await settings.load();
  const dbs = await databases.load();

  container.add({
    logger,
    settings: stts,
    databases: dbs
  });

  await server.start(container);
  await poller.start(container);

  logger.info('Application fully bootstrapped');
}

main();
