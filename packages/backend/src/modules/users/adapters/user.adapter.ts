import { UserEntity } from '../../../core/entities/user.entity';
import { User } from '../domain/user.model';
import { ResponseUserDto } from '../controllers/dto/users.dto';

export class UserAdapter {
    static entityToDomain(userEntity: UserEntity): User {
        return {
            id: userEntity.id,
            firstName: userEntity.firstName,
            lastName: userEntity.lastName,
            phone: userEntity.phone,
            email: userEntity.email,
            address: userEntity.address,
            password: userEntity.password,
            description: userEntity.description,
            isSuperAdmin: userEntity.isSuperAdmin,
            newsletter: userEntity.newsletter,
            prefferedNotifMethod: userEntity.prefferedNotifMethod,
            profileImageUrl: userEntity.profileImageUrl,
        };
    }

    static listEntityToDomain(userEntities: UserEntity[]): User[] {
        return userEntities.map((userEntity) => this.entityToDomain(userEntity));
    }

    static domainToEntity(user: User): UserEntity {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            email: user.email,
            address: user.address,
            password: user.password,
            description: user.description,
            isSuperAdmin: user.isSuperAdmin,
            newsletter: user.newsletter,
            prefferedNotifMethod: user.prefferedNotifMethod,
        };
    }

    static domainToResponseUser(user: User): ResponseUserDto {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            email: user.email,
            address: user.address,
            description: user.description,
            isSuperAdmin: user.isSuperAdmin,
            newsletter: user.newsletter,
            prefferedNotifMethod: user.prefferedNotifMethod,
            profileImageUrl: user.profileImageUrl,
        };
    }

    static listDomainToResponseUser(users: User[]): ResponseUserDto[] {
        return users.map((userEntity) => this.domainToResponseUser(userEntity));
    }
}
