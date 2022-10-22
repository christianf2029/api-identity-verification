import AWS from 'aws-sdk';
import refundCtrlPoller from '../../../adapters/controllers/poller/refund.ctrl.poller';
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
    case 'REFUND_REQUEST':
      await refundCtrlPoller.requestRefund(container, parsedMessageBody);
      break;
    default:
      logger.warn('Unmapped message type');
  }

  logger.info('SQS Message processed');
};
