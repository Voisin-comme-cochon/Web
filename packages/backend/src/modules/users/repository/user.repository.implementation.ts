import { DataSource } from 'typeorm';
import { UserEntity } from '../../../core/entities/user.entity';
import { UsersRepository } from '../../domain/users.abstract.repository';

export class UserRepositoryImplementation implements UsersRepository {
    constructor(private readonly dataSource: DataSource) {}

    public getUsers(): Promise<UserEntity[]> {
        return this.dataSource.getRepository(UserEntity).find({
            where: {
                id: 1,
            },
        });
    }
}
