import databases from './infra/databases';
import server from './infra/http';
import poller from './infra/poller';
import register from './infra/register';
import settings from './infra/settings';
import logging from './infra/tools/logger';

const main = async (): Promise<void> => {
  const logger = logging.load();

  const container = register.load();
  logger.info('Dependencies loaded');

  const stts = await settings.load();
  logger.info('Settings loaded');

  const dbs = await databases.load();
  logger.info('Databases loaded');

  container.add({
    logger,
    settings: stts,
    databases: dbs,
  });

  await server.start(container);
  await poller.start(container);

  logger.info('Application fully bootstrapped');
};

main();
