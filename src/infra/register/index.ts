import AWS from 'aws-sdk';
import axios, { Axios } from 'axios';
import express from 'express';
import { Settings } from '../settings';
import { Logger } from '../tools/logger';

export type AppContainer = {
  resolve: {
    aws: typeof AWS,
    axios: Axios,
    express: typeof express,
    logger: Logger,
    settings: Settings
  },
  add: (d: any) => void
};

export default {
  load: (): AppContainer => {
    const dependencies: any = {
      aws: AWS,
      axios: axios.create(),
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
