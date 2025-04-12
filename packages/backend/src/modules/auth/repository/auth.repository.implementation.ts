import { DataSource } from 'typeorm';
import { AuthRepository } from '../domain/auth.abstract.repository';
import { UserTokenEntity } from '../../../core/entities/user-tokens.entity';

export class AuthRepositoryImplementation implements AuthRepository {
    constructor(private readonly dataSource: DataSource) {}

    async deleteToken(token: string): Promise<void> {
        await this.dataSource.getRepository(UserTokenEntity).delete({
            token: token,
        });
    }

    async getToken(token: string): Promise<UserTokenEntity | null> {
        return this.dataSource
            .getRepository(UserTokenEntity)
            .createQueryBuilder('user_tokens')
            .where('user_tokens.token = :token', { token: token })
            .andWhere('user_tokens.expirationDate > NOW()')
            .getOne();
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
        const insertedToken = this.dataSource.getRepository(UserTokenEntity).create({
            token: token,
            userId: userId,
            expirationDate: new Date(new Date().getTime() + 15 * 60 * 1000),
        });

        await this.dataSource.getRepository(UserTokenEntity).save(insertedToken);
    }
}
