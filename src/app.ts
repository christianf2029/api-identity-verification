import register from './infra/register'
import settings from './infra/settings';
import databases from './infra/databases';
import server from './infra/gateways/http';
import poller from './infra/gateways/poller';

const main = async (): Promise<void> => {
  const container = register.load();

  const stts = await settings.load();
  const dbs = await databases.load();

  container.add({ 
    settings: stts,
    databases: dbs
  });

  await server.start(container);
  await poller.start(container);

}

main();
