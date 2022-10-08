import pino, { Logger as PinoLogger } from 'pino';
import pinopretty from 'pino-pretty';

export interface Logger {
  debug(msg: string, data?: any): void,
  info(msg: string, data?: any): void,
  warn(msg: string, data?: any): void,
  error(msg: string, data?: any): void
}

class LoggerWrapper implements Logger {
  private _logger: PinoLogger;

  constructor() {
    this._logger = pino(
      {
        name: 'api-identity-verification',
        level: 'debug',
      },
      pinopretty({
        colorize: true,
      })
    );
  }

  public debug(msg: string, data?: any): void {
    this._logger.debug({ msg, ...data });
  }
  public info(msg: string, data?: any): void {
    this._logger.info({ msg, ...data });
  }
  public warn(msg: string, data?: any): void {
    this._logger.warn({ msg, ...data });
  }
  public error(msg: string, data?: any): void {
    this._logger.error({ msg, ...data });
  }
}

export default {
  load: (): Logger => {
    return new LoggerWrapper();
  }
};
