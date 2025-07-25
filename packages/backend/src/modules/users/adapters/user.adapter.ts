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
            latitude: userEntity.latitude,
            longitude: userEntity.longitude,
            password: userEntity.password,
            description: userEntity.description,
            isSuperAdmin: userEntity.isSuperAdmin,
            newsletter: userEntity.newsletter,
            prefferedNotifMethod: userEntity.prefferedNotifMethod,
            profileImageUrl: userEntity.profileImageUrl,
            tags: userEntity.tags
                ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  userEntity.tags.filter((userTag) => userTag.tag !== undefined).map((userTag) => userTag.tag!)
                : [],
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
            latitude: user.latitude,
            longitude: user.longitude,
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
            latitude: user.latitude,
            longitude: user.longitude,
            description: user.description,
            isSuperAdmin: user.isSuperAdmin,
            newsletter: user.newsletter,
            prefferedNotifMethod: user.prefferedNotifMethod,
            profileImageUrl: user.profileImageUrl,
            tags: user.tags,
        };
    }

    static listDomainToResponseUser(users: User[]): ResponseUserDto[] {
        return users.map((userEntity) => this.domainToResponseUser(userEntity));
    }
}
