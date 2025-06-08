import { DataSource } from 'typeorm';
import { UserEntity } from '../../../core/entities/user.entity';
import { NeighborhoodEntity } from '../../../core/entities/neighborhood.entity';
import { NeighborhoodUserEntity } from '../../../core/entities/neighborhood-user.entity';
import { UsersRepository } from '../domain/users.abstract.repository';
import { UserTagEntity } from '../../../core/entities/user-tag.entity';
import { UserAdapter } from '../adapters/user.adapter';
import { User } from '../domain/user.model';

export class UserRepositoryImplementation implements UsersRepository {
    constructor(private readonly dataSource: DataSource) {}

    public getUsers(limit: number, offset: number): Promise<[UserEntity[], number]> {
        return this.dataSource.getRepository(UserEntity).findAndCount({
            skip: offset,
            take: limit,
            relations: {
                tags: {
                    tag: true,
                },
            },
        });
    }

    public async findByEmail(email: string): Promise<UserEntity | null> {
        return this.dataSource.getRepository(UserEntity).findOne({
            where: { email },
            relations: {
                tags: {
                    tag: true,
                },
            },
        });
    }

    public async findByPhone(phone: string): Promise<UserEntity | null> {
        return this.dataSource.getRepository(UserEntity).findOne({
            where: { phone },
            relations: {
                tags: {
                    tag: true,
                },
            },
        });
    }

    public async getUserById(id: number): Promise<User | null> {
        const user = await this.dataSource.getRepository(UserEntity).findOne({
            where: { id },
            relations: {
                tags: {
                    tag: true,
                },
            },
        });

        if (!user) {
            return null;
        }

        return UserAdapter.entityToDomain(user);
    }

    public async createUser(user: UserEntity): Promise<UserEntity> {
        console.log('user', user);
        const savedUser = await this.dataSource.getRepository(UserEntity).save(user);

        if (user.tags && user.tags.length > 0) {
            const userTags = user.tags.map((userTag) => {
                userTag.userId = savedUser.id;
                return userTag;
            });
            await this.dataSource.getRepository(UserTagEntity).save(userTags);
        }

        return savedUser;
    }

    public async updateUserPassword(userId: number, password: string): Promise<void> {
        await this.dataSource.getRepository(UserEntity).update({ id: userId }, { password: password });
    }

    public async getUserNeighborhoods(userId: number): Promise<NeighborhoodEntity[]> {
        const neighborhoodUsers = await this.dataSource.getRepository(NeighborhoodUserEntity).find({
            where: { userId },
            relations: ['neighborhood'],
        });

        return neighborhoodUsers.map((nu) => nu.neighborhood);
    }
}
