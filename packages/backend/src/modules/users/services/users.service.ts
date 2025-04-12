import { User } from '../domain/user.model';
import { UserAdapter } from '../adapters/user.adapter';
import { UsersRepository } from '../domain/users.abstract.repository';
import { CochonError } from '../../../utils/CochonError';

export class UsersService {
    constructor(private userRepository: UsersRepository) {}

    public async getUsers(): Promise<User[]> {
        const users = await this.userRepository.getUsers();
        return UserAdapter.listEntityToDomain(users);
    }

    public async getUserById(id: number): Promise<User> {
        const user = await this.userRepository.getUserById(id);
        if (!user) {
            throw new CochonError('user-not-found', 'User not found', 404);
        }
        return UserAdapter.entityToDomain(user);
    }
}
