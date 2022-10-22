import https from 'https';
import apiPixCredentials from './api-pix/credentials.json';
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
  },
  apiPix: {
    url: string,
    credentials: {
      clientId: string,
      clientSecret: string
    },
    httpsAgent: https.Agent
  }
};

export default {
  load: (): Settings => {
    return {
      ...settings,
      apiPix: {
        url: apiPixCredentials.url,
        credentials: {
          clientId: apiPixCredentials.credentials.clientId,
          clientSecret: apiPixCredentials.credentials.clientSecret,
        },
        httpsAgent: new https.Agent({
          cert: apiPixCredentials.cert.pub,
          key: apiPixCredentials.cert.priv,
          keepAlive: true,
          rejectUnauthorized: false
        })
      }
    };
  }
};
