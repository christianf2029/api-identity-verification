import axios, { Axios } from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import { Settings } from '../settings';
import { Logger } from '../tools/logger';

export type AppContainer = {
  resolve: {
    axios: Axios,
    bodyParser: typeof bodyParser,
    express: typeof express,
    logger: Logger,
    settings: Settings
  },
  add: (d: any) => void
};

export default {
  load: (): AppContainer => {
    const dependencies: any = {
      axios: axios.create(),
      bodyParser: bodyParser,
      express: express
    };

    return {
      resolve: dependencies,
      add: (news: { [k: string]: any; }) => {
        Object.entries(news).forEach(([k, dependency]) => {
          dependencies[k] = dependency;
        });
      }
    };
  },
};
