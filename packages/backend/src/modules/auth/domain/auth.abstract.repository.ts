import { UserTokenEntity } from '../../../core/entities/user-tokens.entity';

export abstract class AuthRepository {
    abstract saveToken(token: string, userId: number): Promise<void>;

    abstract getTokensByUserId(userId: number): Promise<UserTokenEntity[]>;

    abstract deleteToken(token: string): Promise<void>;

    abstract getToken(token: string): Promise<UserTokenEntity | null>;
}
