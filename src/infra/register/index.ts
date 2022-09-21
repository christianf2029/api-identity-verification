import express from 'express';
import { Logger } from 'pino';

export type AppContainer = {
  resolve: {
    express: typeof express,
    logger: Logger
  },
  add: (d: any) => void
}

export default {
  load: (): AppContainer => {
    const dependencies: any = {
      express: express
    };

    return {
      resolve: dependencies,
      add: (news: { [k: string]: any }) => {
        Object.entries(news).forEach(([k, dependency]) => {
          dependencies[k] = dependency
        });
      }
    }
  }
};
