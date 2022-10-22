import UserRepository from '../../../adapters/repositories/user.repository';
import { AppContainer } from '../../../infra/register';
import { Logger } from '../../../infra/tools/logger';
import { UsersListGetterOutput } from './types';

export default class UsersListGetter {
  private userRepository: UserRepository;
  private logger: Logger;

  constructor(params: AppContainer) {
    this.userRepository = new UserRepository(params);
    this.logger = params.resolve['logger'];
  }
  public async execute(): Promise<UsersListGetterOutput> {
    this.logger.info('Getting the users list');
    const users = await this.userRepository.getAll();

    return users.sort((u1, u2) => {
      return u1.registration.at.localeCompare(u2.registration.at) * -1;
    });
  }
}
