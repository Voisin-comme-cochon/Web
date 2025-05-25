import { User } from '../domain/user.model';
import { UserAdapter } from '../adapters/user.adapter';
import { UsersRepository } from '../domain/users.abstract.repository';
import { CochonError } from '../../../utils/CochonError';
import { ObjectStorageService } from '../../objectStorage/services/objectStorage.service';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';
import { isNotNull, isNull } from '../../../utils/tools';

export class UsersService {
    constructor(
        private userRepository: UsersRepository,
        private objectStorageService: ObjectStorageService
    ) {}

    public async getUsers(page: number, limit: number): Promise<[User[], number]> {
        const offset = page * limit - limit;
        const [users, count] = await this.userRepository.getUsers(limit, offset);

        await Promise.all(
            users.map(async (user) => {
                if (isNotNull(user.profileImageUrl)) {
                    user.profileImageUrl = await this.replaceUrlByLink(user.profileImageUrl);
                }
            })
        );

        const domainUser = UserAdapter.listEntityToDomain(users);
        return [domainUser, count];
    }

    public async getUserById(id: number): Promise<User> {
        const user = await this.userRepository.getUserById(id);
        if (!user) {
            throw new CochonError('user-not-found', 'User not found', 404);
        }

        if (isNotNull(user.profileImageUrl)) {
            user.profileImageUrl = await this.replaceUrlByLink(user.profileImageUrl);
        }

        return UserAdapter.entityToDomain(user);
    }

    async replaceUrlByLink(url: string): Promise<string> {
        if (isNull(url)) {
            return '';
        }
        const file = await this.objectStorageService.getFileLink(url, BucketType.PROFILE_IMAGES);
        if (!file) {
            throw new CochonError('file-not-found', 'File not found', 404);
        }

        return file;
    }
}
