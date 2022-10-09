import AWS from 'aws-sdk';
import { Consumer } from 'sqs-consumer';
import { AppContainer } from '../register';
import { Settings } from '../settings';
import { Logger } from '../tools/logger';
import routes from './routes';

const validateSQSExistence = async (settings: Settings, logger: Logger) => {
  const sqsManager = new AWS.SQS({
    endpoint: settings.sqsPoller.endpoint
  });

  try {
    await sqsManager
      .getQueueUrl({ QueueName: settings.sqsPoller.queue.name })
      .promise();

    logger.info('Queue already exists, skipping');

    return;
  } catch (err: any) {
    if (err.code !== 'AWS.SimpleQueueService.NonExistentQueue') {
      logger.error('A unknown error occurred while checking queue existence', { err });
      throw err;
    }
  }

  logger.info('Queue does not exist, creating it');

  await sqsManager
    .createQueue({ QueueName: settings.sqsPoller.queue.name })
    .promise();
};

export default {
  start: async (container: AppContainer): Promise<void> => {
    const settings = container.resolve['settings'];
    const logger = container.resolve['logger'];

    AWS.config.update({
      apiVersion: 'latest',
      region: settings.aws.region,
      credentials: {
        accessKeyId: settings.aws.credentials.accessKeyId,
        secretAccessKey: settings.aws.credentials.secretAccessKey
      }
    });

    await validateSQSExistence(settings, logger);

    const poller = Consumer.create({
      region: settings.aws.region,
      queueUrl: settings.sqsPoller.queue.url,
      messageAttributeNames: ['Type'],
      handleMessage: async (message: AWS.SQS.Message) => {
        await routes(container, message);
      }
    });

    poller.on('error', (err: any) => {
      logger.error('SQS Consumer error', { err });
    });

    poller.on('processing_error', (err: any) => {
      logger.error('SQS Consumer processing error', { err });
    });

    poller.on('timeout_error', (err: any) => {
      logger.error('SQS Consumer timeout error', { err });
    });

    poller.start();

    logger.info('SQS Poller started', {
      queueUrl: settings.sqsPoller.queue.url
    });
  }
};
