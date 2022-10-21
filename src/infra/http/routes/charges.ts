import { Express } from 'express';
import chargesCtrlHttp from '../../../adapters/controllers/http/charges.ctrl.http';

export default (server: Express) => {

  server.route('/charges/new')
    .get(chargesCtrlHttp.getNew);

  server.route('/charges/:id/status')
    .get(chargesCtrlHttp.getChargeStatus);

};
