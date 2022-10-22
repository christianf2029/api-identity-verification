import crypto from 'crypto';
import { User, UserIdentification, UserRegistration } from '../../../adapters/entities/user.entity';
import UserRepository from '../../../adapters/repositories/user.repository';
import { AppContainer } from '../../../infra/register';
import { Logger } from '../../../infra/tools/logger';
import { UsersListStorerInput, UsersListStorerOutput } from './types';

export default class UsersListStorer {
  private userRepository: UserRepository;
  private logger: Logger;

  constructor(params: AppContainer) {
    this.userRepository = new UserRepository(params);
    this.logger = params.resolve['logger'];
  }

  public async execute(input: UsersListStorerInput): Promise<UsersListStorerOutput> {
    const newUsers = this.parseInput(input);

    this.logger.info('Deleting all users to store the news');
    await this.userRepository.deleteAll();

    this.logger.info('Storing the new users');
    await this.userRepository.save(...newUsers);

    return newUsers;
  }

  private parseInput(input: UsersListStorerInput): User[] {
    if (!Array.isArray(input)) {
      this.logger.error('Invalid user list input');
      throw new Error('Invalid user list input');
    }

    return input.map((rawUser) => {
      const name = rawUser.name;
      const document = rawUser.cpf ?? rawUser.cnpj;

      if (!name || !document) {
        this.logger.error('Invalid user list input, missing user document');
        throw new Error('Invalid user list input');
      }

      const id = crypto.randomUUID();

      const identification: UserIdentification = {
        status: 'awaiting'
      };

      const registration: UserRegistration = {
        by: 'integrator',
        at: (new Date()).toISOString()
      };

      return new User(id, name, document, identification, registration);
    });
  }
}
