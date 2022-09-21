import pino, { Logger } from 'pino';
import pinopretty from 'pino-pretty'

export default {
  load: (): Logger => {
    return pino({
      name: 'api-identity-verification',
      level: 'debug'
    }, pinopretty({
      colorize: true
    }));
  }
}
