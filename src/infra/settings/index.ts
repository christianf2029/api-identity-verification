import settings from './settings.json';

export type Settings = {
  aws: {
    region: string,
    credentials: {
      accessKeyId: string,
      secretAccessKey: string
    }
  },
  httpServer: {
    port: number
  },
  sqsPoller: {
    endpoint: string,
    queue: {
      name: string,
      url: string
    }
  }
};

export default {
  load: (): Settings => {
    return settings;
  }
};
