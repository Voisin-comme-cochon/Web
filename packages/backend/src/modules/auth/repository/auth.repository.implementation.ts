import { DataSource, MoreThan } from 'typeorm';
import { AuthRepository } from '../domain/auth.abstract.repository';
import { UserTokenEntity } from '../../../core/entities/user-tokens.entity';

export class AuthRepositoryImplementation implements AuthRepository {
    constructor(private readonly dataSource: DataSource) {}

    async deleteToken(token: string): Promise<void> {
        const tkn = await this.dataSource.getRepository(UserTokenEntity).findOneBy({ token });
        if (!tkn) {
            throw new Error(`User token ${token} not found`);
        }
        await this.dataSource.getRepository(UserTokenEntity).remove(tkn);
    }

    async getToken(token: string): Promise<UserTokenEntity | null> {
        return this.dataSource.getRepository(UserTokenEntity).findOne({
            where: {
                token: token,
                expirationDate: MoreThan(new Date()),
            },
        });
    }

    getTokensByUserId(userId: number): Promise<UserTokenEntity[]> {
        return this.dataSource
            .getRepository(UserTokenEntity)
            .createQueryBuilder('user_tokens')
            .where('user_tokens.userId = :userId', { userId: userId })
            .andWhere('user_tokens.expirationDate > NOW()')
            .getMany();
    }

    async saveToken(token: string, userId: number): Promise<void> {
        const repo = this.dataSource.getRepository(UserTokenEntity);
        const expirationDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

        await repo
            .createQueryBuilder()
            .insert()
            .into(UserTokenEntity)
            .values({ token, userId, expirationDate })
            .orIgnore()
            .execute();
    }
}
