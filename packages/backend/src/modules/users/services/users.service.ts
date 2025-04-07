import {User} from "../../domain/user.model";
import {UserAdapter} from "../adapters/user.adapter";
import {UsersRepository} from "../../domain/users.abstract.repository";

export class UsersService {
    constructor(private userRepository: UsersRepository) {}

    public async getUsers(): Promise<User[]> {
        const users = await this.userRepository.getUsers();
        return UserAdapter.listEntityToDomain(users);
    }
}
