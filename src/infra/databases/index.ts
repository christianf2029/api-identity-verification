import databases from './databases.json';

export type Databases = any;

export default {
  load: (): Databases => {
    return databases;
  },
};
