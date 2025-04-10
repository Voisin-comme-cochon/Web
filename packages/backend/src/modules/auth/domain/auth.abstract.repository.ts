import { UserTokenEntity } from '../../../core/entities/user-tokens.entity';

export abstract class AuthRepository {
    abstract saveToken(token: string, userId: number): Promise<void>;

    abstract getTokensByUserId(userId: string): Promise<UserTokenEntity[]>;

    abstract deleteToken(token: string): Promise<void>;
}
