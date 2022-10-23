import { createClient } from 'redis';
import { AppContainer } from '../../infra/register';
import { User, UserIdentification, UserRegistration } from '../entities/user.entity';

export default class UserRepository {
  private redis: ReturnType<typeof createClient>;

  constructor(params: AppContainer) {
    this.redis = params.resolve['databases'].redis;
  }

  public async deleteAll(): Promise<void> {
    await this.redis.del('users:id');
    await this.redis.del('users:document');
    await this.redis.del('users:endToEndId');
  }

  public async save(...users: User[]): Promise<void> {
    for (const user of users) {
      await this.redis.hSet('users:id', user.id, user.toString());
      await this.redis.hSet('users:document', user.document, user.toString());

      if (user.identification.endToEndId) {
        await this.redis.hSet('users:endToEndId', user.identification.endToEndId, user.toString());
      }
    }
  }

  public async update(user: User): Promise<void> {
    await this.redis.hSet('users:id', user.id, user.toString());
    await this.redis.hSet('users:document', user.document, user.toString());

    if (user.identification.endToEndId) {
      await this.redis.hSet('users:endToEndId', user.identification.endToEndId, user.toString());
    }
  }

  public async getByDocument(document: string, documentIsMasked = false): Promise<User> {
    let rawUserStr: any;

    if (documentIsMasked) {
      const userDocuments = await this.redis.hKeys('users:document');

      const matchedDocument = userDocuments.find((userDocument) => {
        return userDocument.includes(document.slice(3, 9), 3);
      });

      if (matchedDocument) {
        rawUserStr = await this.redis.hGet('users:document', matchedDocument);
      }
    } else {
      rawUserStr = await this.redis.hGet('users:document', document);
    }

    if (!rawUserStr) {
      return undefined as any;
    }

    const rawUser = JSON.parse(rawUserStr);

    return new User(
      rawUser.id,
      rawUser.name,
      rawUser.document,
      rawUser.identification as UserIdentification,
      rawUser.registration as UserRegistration
    );
  }

  public async getByEndToEndId(endToEndId: string): Promise<User> {
    const rawUserStr = await this.redis.hGet('users:endToEndId', endToEndId);

    if (!rawUserStr) {
      return undefined as any;
    }

    const rawUser = JSON.parse(rawUserStr);

    return new User(
      rawUser.id,
      rawUser.name,
      rawUser.document,
      rawUser.identification as UserIdentification,
      rawUser.registration as UserRegistration
    );
  }

  public async getAll(): Promise<User[]> {
    const rawUsersById = await this.redis.hGetAll('users:id');

    return Object
      .values(rawUsersById)
      .map((rawUserStr) => {
        const rawUser = JSON.parse(rawUserStr);

        return new User(
          rawUser.id,
          rawUser.name,
          rawUser.document,
          rawUser.identification as UserIdentification,
          rawUser.registration as UserRegistration
        );
      })
      .sort((user1, user2) => {
        return user1.registration.at.localeCompare(user2.registration.at);
      });
  }
}
