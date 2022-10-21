import { Express } from 'express';

export default (server: Express) => {

  server.route('/users')
    .post()
    .get();

};
