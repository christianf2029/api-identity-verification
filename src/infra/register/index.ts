import bodyParser from 'body-parser';
import express from 'express';
import { Logger } from 'pino';

export type AppContainer = {
  resolve: {
    bodyParser: typeof bodyParser,
    express: typeof express,
    logger: Logger
  },
  add: (d: any) => void
}

export default {
  load: (): AppContainer => {
    const dependencies: any = {
      bodyParser: bodyParser,
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
