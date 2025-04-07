import { UserEntity } from 'src/core/entities/user.entity';

export abstract class UsersRepository {
    abstract getUsers(): Promise<UserEntity[]>;
}
