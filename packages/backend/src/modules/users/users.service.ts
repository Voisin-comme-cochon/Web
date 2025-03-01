import { UserRepository } from './user.repository';
import { UserDto } from './models/users.dto';

export class UsersService {
    constructor(private userRepository: UserRepository) {}

    public getById(userId: number): UserDto {
        return this.userRepository.getById(userId);
    }
}
