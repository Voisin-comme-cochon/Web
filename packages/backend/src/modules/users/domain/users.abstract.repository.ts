import { UserEntity } from 'src/core/entities/user.entity';

export abstract class UsersRepository {
    abstract getUsers(limit: number, offset: number): Promise<[UserEntity[], number]>;

    abstract findByEmail(email: string): Promise<UserEntity | null>;

    abstract findByPhone(phone: string): Promise<UserEntity | null>;

    abstract getUserById(id: number): Promise<UserEntity | null>;

    abstract createUser(user: UserEntity): Promise<UserEntity>;

    abstract updateUserPassword(userId: number, password: string): Promise<void>;
}
