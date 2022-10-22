import AWS from 'aws-sdk';
import crypto from 'crypto';
import { User } from '../../../adapters/entities/user.entity';
import UserRepository from '../../../adapters/repositories/user.repository';
import { AppContainer } from '../../../infra/register';
import { Settings } from '../../../infra/settings';
import { Logger } from '../../../infra/tools/logger';
import { Payment, PaymentNotificationReceiverInput, PaymentNotificationReceiverOutput } from './types';

export default class PaymentNotificationReceiver {
  private aws: typeof AWS;
  private settings: Settings;
  private userRepository: UserRepository;
  private logger: Logger;

  constructor(params: AppContainer) {
    this.aws = params.resolve['aws'];
    this.settings = params.resolve['settings'];
    this.userRepository = new UserRepository(params);
    this.logger = params.resolve['logger'];
  }

  public async execute(input: PaymentNotificationReceiverInput): Promise<PaymentNotificationReceiverOutput> {
    this.logger.info('New payment notification received', { input });

    const payment = this.parseInput(input);

    if (!payment.returns) {
      this.logger.info('New payment received');

      this.logger.info('Triggering payment full refund');
      await this.triggerPaymentRefund(payment);

      this.logger.info('Handling the new payment received');
      await this.handleNewPaymentReceived(payment);
    } else {
      this.logger.info('Payment return feedback received');

      this.logger.info('Handling the return feedback received');
      await this.handlePaymentReturnFeedbackReceived(payment);
    }

    this.logger.info('Payment notification processing finished');
  }

  private parseInput({ pix: [pix] }: PaymentNotificationReceiverInput): Payment {
    const payment: Payment = {
      endToEndId: pix.endToEndId,
      txid: pix.txid,
      key: pix.chave,
      value: pix.valor,
      effectiveDate: pix.horario,
      payerInfo: pix.infoPagador
    };

    if (pix.gnExtras) {
      const rawPayerDocument = pix.gnExtras.pagador.cpf ?? pix.gnExtras.pagador.cnpj;

      if (!rawPayerDocument) {
        this.logger.error('Payer information provided, but your document is not');
        throw new Error('Payment notification received is in invalid format');
      }

      payment.extras = {
        fee: pix.gnExtras.tarifa,
        payerName: pix.gnExtras.pagador.nome,
        payerDocument: rawPayerDocument.replace(/\s|\.|-/g, ''),
        payerDocumentIsMasked: rawPayerDocument.includes('*')
      };
    }

    if (pix.devolucoes && pix.devolucoes.length > 0) {
      payment.returns = pix.devolucoes.map((devolucao) => {
        return {
          id: devolucao.id,
          rtrId: devolucao.rtrId,
          value: devolucao.valor,
          status: devolucao.status,
          requestDate: devolucao.horario.solicitacao,
          effectiveDate: devolucao.horario.liquidacao
        };
      });
    }

    return payment;
  }

  private async triggerPaymentRefund(payment: Payment): Promise<void> {
    const sqsHandler = new this.aws.SQS();

    try {
      await sqsHandler.sendMessage({
        MessageAttributes: {
          Type: {
            DataType: 'String',
            StringValue: 'REFUND_REQUEST'
          }
        },
        MessageBody: JSON.stringify(payment),
        QueueUrl: this.settings.sqsPoller.queue.url
      }).promise();
    } catch (err: any) {
      this.logger.error('A unknown error occurred while triggering payment refund', { err });
      throw new Error('Payment refund trigger failed');
    }
  }

  private async handleNewPaymentReceived(payment: Payment): Promise<void> {
    if (!payment.extras?.payerName || !payment.extras?.payerDocument) {
      this.logger.error('Payer information not provided by the Pix API');
      throw new Error('Payment notification received is in invalid format');
    }

    this.logger.info('Getting some user with this payerDocument');
    const user = await this.userRepository.getByDocument(
      payment.extras.payerDocument,
      payment.extras.payerDocumentIsMasked
    );

    if (user) {
      this.logger.info('User identified, updating it', { user: user.toJSON() });

      user.identification.status = 'validated';
      user.identification.at = payment.effectiveDate;
      user.identification.chargeId = payment.txid;
      user.identification.endToEndId = payment.endToEndId;

      await this.userRepository.update(user);
    } else {
      this.logger.info('A user not registered by the integrator was identified');

      const newUserIdentifiedByPayment = new User(
        crypto.randomUUID(),
        payment.extras.payerName,
        payment.extras.payerDocument,
        {
          status: 'validated',
          at: payment.effectiveDate,
          chargeId: payment.txid,
          endToEndId: payment.endToEndId
        },
        {
          by: 'payment_transaction',
          at: (new Date()).toISOString()
        }
      );

      await this.userRepository.save(newUserIdentifiedByPayment);
    }
  }

  private async handlePaymentReturnFeedbackReceived(payment: Payment): Promise<void> {
    if (!payment.returns) {
      this.logger.error('Payment return notification does not contain return array');
      throw Error('Payment return notification does not contain return array');
    }

    const user = await this.userRepository.getByEndToEndId(payment.endToEndId);

    if (!user) {
      this.logger.error('Payment associated with this return was not identified');
      throw new Error('Payment associated with this return was not identified');
    }

    user.identification.returnId = payment.returns[0].rtrId;

    await this.userRepository.update(user);
  }
}
