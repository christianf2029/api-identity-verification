import AWS from 'aws-sdk';
import devolutionCtrlPoller from '../../../adapters/controllers/poller/devolution.ctrl.poller';
import { AppContainer } from '../../register';

export default async (container: AppContainer, message: AWS.SQS.Message) => {
  const logger = container.resolve['logger'];

  logger.info('SQS Message received', { message });

  if (!message.MessageAttributes) {
    logger.warn('Unprocessable SQS Message');
    return;
  }

  if (!message.Body) {
    logger.warn('SQS Message without body');
    return;
  }

  const parsedMessageBody = JSON.parse(message.Body);

  switch (message.MessageAttributes.Type.StringValue) {
    case 'DEVOLUTION_REQUEST':
      await devolutionCtrlPoller.requestDevolution(container, parsedMessageBody);
      break;
    default:
      logger.warn('Unmapped message type');
  }

  logger.info('SQS Message processed');
};
