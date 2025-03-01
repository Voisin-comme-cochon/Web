import { UserAdapter } from './adapters/user.adapter';

export class UserRepository {
    public getById(userId: number) {
        return UserAdapter.toDTO({
            id: userId,
            fullName: 'John Doe',
        });
    }
}
