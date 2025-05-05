import { DataSource } from 'typeorm';
import { UserEntity } from '../../../core/entities/user.entity';
import { UsersRepository } from '../domain/users.abstract.repository';

export class UserRepositoryImplementation implements UsersRepository {
    constructor(private readonly dataSource: DataSource) {}

    public getUsers(): Promise<UserEntity[]> {
        return this.dataSource.getRepository(UserEntity).find();
    }

    public findByEmail(email: string): Promise<UserEntity | null> {
        return this.dataSource.getRepository(UserEntity).findOne({
            where: {
                email: email,
            },
        });
    }

    public findByPhone(phone: string): Promise<UserEntity | null> {
        return this.dataSource.getRepository(UserEntity).findOne({
            where: {
                phone: phone,
            },
        });
    }

    public getUserById(id: number): Promise<UserEntity | null> {
        return this.dataSource.getRepository(UserEntity).findOne({
            where: {
                id: id,
            },
        });
    }

    public createUser(user: UserEntity): Promise<UserEntity> {
        return this.dataSource.getRepository(UserEntity).save(user);
    }

    public async updateUserPassword(userId: number, password: string): Promise<void> {
        await this.dataSource.getRepository(UserEntity).update({ id: userId }, { password: password });
    }
}
