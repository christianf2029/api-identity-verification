import { AppContainer } from '../../../infra/register';
import DevolutionRequester from '../../../interactors/payments/devolution-requester';
import { DevolutionRequesterInput } from '../../../interactors/payments/devolution-requester/types';

export default {
  requestDevolution: async (container: AppContainer, input: DevolutionRequesterInput) => {
    const devolutionRequester = new DevolutionRequester(container);
    const logger = container.resolve['logger'];

    try {
      await devolutionRequester.execute(input);
    } catch (err: any) {
      logger.error('An error ocurred while requesting devolution', { err: err.data, errr: err.response?.data });
    }
  }
};
