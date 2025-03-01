import { User } from '../../../core/entities/user.entity';
import { UserDto } from '../models/users.dto';

export class UserAdapter {
    public static toDTO(user: User): UserDto {
        return {
            id: user.id,
            fullName: user.fullName,
        };
    }
}
