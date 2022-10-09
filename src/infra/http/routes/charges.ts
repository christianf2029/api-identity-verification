import { Express } from 'express';
import chargesCtrlHttp from '../../../adapters/controllers/http/charges.ctrl.http';

export default (server: Express) => {
  server.get(
    '/charges/new',
    chargesCtrlHttp.getNew
  );

  server.get(
    '/charges/:id/status',
    chargesCtrlHttp.getChargeStatus
  );
};
