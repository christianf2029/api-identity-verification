import { User } from '../../../adapters/entities/user.entity';

export type UsersListStorerInput = Array<{
  name: string,
  cpf?: string,
  cnpj?: string
}>;

export type UsersListStorerOutput = User[];
