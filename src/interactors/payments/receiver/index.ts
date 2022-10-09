import AWS from 'aws-sdk';
import { AppContainer } from '../../../infra/register';
import { Settings } from '../../../infra/settings';
import { Logger } from '../../../infra/tools/logger';
import { Payment, PaymentReceiverInput } from './types';

export default class PaymentReceiver {
  private aws: typeof AWS;
  private settings: Settings;
  private logger: Logger;

  constructor(params: AppContainer) {
    this.aws = params.resolve['aws'];
    this.settings = params.resolve['settings'];
    this.logger = params.resolve['logger'];
  }

  public async execute(input: PaymentReceiverInput) {
    this.logger.info('Payment notification received', { input });

    const payment = this.parseInput(input);

    if (payment.devolutions && payment.devolutions.length > 0) {
      this.logger.info('Devolution feedback received', { payment });
      return;
    }

    this.logger.info('New payment received', { payment });

    this.logger.info('Triggering full payment chargeback');

    await this.triggerPaymentChargeback(payment);

    if (!payment.extras.payerName || !payment.extras.payerDocument) {
      this.logger.error('Payer information not provided by the Pix API');
      return;
    }

    // TODO: implementar conferência na lista do prestador de serviço
    // referênte às pessoas autorizadas a serem validadas

    this.logger.info('New payment received processing finished');
  }

  private parseInput({ pix: [pix] }: PaymentReceiverInput): Payment {
    const payment: Payment = {
      endToEndId: pix.endToEndId,
      txid: pix.txid,
      key: pix.chave,
      value: pix.valor,
      effectiveDate: pix.horario,
      payerInfo: pix.infoPagador,
      extras: {
        fee: pix.gnExtras?.tarifa,
        payerName: pix.gnExtras?.pagador.nome,
        payerDocument: pix.gnExtras?.pagador.cpf ?? pix.gnExtras?.pagador.cnpj,
      }
    };

    if (pix.devolucoes && pix.devolucoes.length > 0) {
      payment.devolutions = pix.devolucoes.map((devolution) => {
        return {
          id: devolution.id,
          rtrId: devolution.rtrId,
          value: devolution.valor,
          status: devolution.status,
          requestDate: devolution.horario.solicitacao,
          effectiveDate: devolution.horario.liquidacao
        };
      });
    }

    return payment;
  }

  private async triggerPaymentChargeback(payment: Payment): Promise<void> {
    const sqsHandler = new this.aws.SQS();

    try {
      await sqsHandler.sendMessage({
        MessageAttributes: {
          Type: {
            DataType: 'String',
            StringValue: 'DEVOLUTION_REQUEST'
          }
        },
        MessageBody: JSON.stringify(payment),
        QueueUrl: this.settings.sqsPoller.queue.url
      }).promise();
    } catch (err: any) {
      this.logger.error('A unknown error occurred while triggering payment chargeback', { err });
      throw new Error('Payment chargeback trigger failed');
    }
  }
}
