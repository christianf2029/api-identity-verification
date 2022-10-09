import { Request, Response, NextFunction } from 'express';
import { AppContainer } from '../../register';

export default (container: AppContainer) => {
  return (req: Request, res: Response, next: NextFunction) => {
    (<any>req).container = container;

    next();
  };
};
