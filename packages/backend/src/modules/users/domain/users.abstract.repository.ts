import { UserEntity } from 'src/core/entities/user.entity';

export abstract class UsersRepository {
    abstract getUsers(): Promise<UserEntity[]>;

    abstract findByEmail(email: string): Promise<UserEntity | null>;

    abstract findByPhone(phone: string): Promise<UserEntity | null>;

    abstract getUserById(id: number): Promise<UserEntity | null>;

    abstract createUser(user: UserEntity): Promise<UserEntity>;
}
