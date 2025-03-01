import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './user.repository';

@Module({
    imports: [],
    controllers: [UsersController],
    providers: [
        UserRepository,
        {
            provide: UsersService,
            inject: [UserRepository],
            useFactory: (userRepository: UserRepository) => new UsersService(userRepository),
        }],
})
export class UsersModule {}
