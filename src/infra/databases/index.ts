import { createClient as createRedisClient } from 'redis';
import databases from './databases.json';

export type Databases = {
  redis: ReturnType<typeof createRedisClient>
};

const loadRedisConnection = async () => {
  const redisClient = createRedisClient({
    url: databases.redis.url,
    database: databases.redis.db
  });

  await redisClient.connect();

  return redisClient;
};

export default {
  load: async (): Promise<Databases> => {
    const redis = await loadRedisConnection();

    return {
      redis
    };
  },
};
