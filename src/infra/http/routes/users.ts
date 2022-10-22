import { Express } from 'express';
import usersCtrlHttp from '../../../adapters/controllers/http/users.ctrl.http';

export default (server: Express) => {

  server.route('/users')
    .post(usersCtrlHttp.storeList)
    .get(usersCtrlHttp.list);

};
