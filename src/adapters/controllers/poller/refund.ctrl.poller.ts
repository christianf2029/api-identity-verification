import { AppContainer } from '../../../infra/register';
import RefundRequester from '../../../interactors/payments/refund-requester';
import { RefundRequesterInput } from '../../../interactors/payments/refund-requester/types';

export default {
  requestRefund: async (container: AppContainer, input: RefundRequesterInput) => {
    const refundRequester = new RefundRequester(container);
    const logger = container.resolve['logger'];

    try {
      await refundRequester.execute(input);
    } catch (err: any) {
      logger.error('An error ocurred while requesting payment refund', { err: err.data, errr: err.response?.data });
    }
  }
};
