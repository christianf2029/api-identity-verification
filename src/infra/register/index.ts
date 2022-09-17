import express from 'express';

export type AppContainer = {
  express: express
}

export default {
  load: (): AppContainer => {
    return undefined;
  }
}
