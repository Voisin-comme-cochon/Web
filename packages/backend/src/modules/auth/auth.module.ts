import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { UsersRepository } from '../users/domain/users.abstract.repository';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepositoryImplementation } from './repository/auth.repository.implementation';
import { AuthRepository } from './domain/auth.abstract.repository';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.VCC_JWT_SECRET,
        }),
        UsersModule,
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: AuthRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => new AuthRepositoryImplementation(dataSource),
        },
        {
            provide: AuthService,
            inject: [AuthRepository, UsersRepository, JwtService],
            useFactory: (authRepository: AuthRepository, usersRepository: UsersRepository, jwtService: JwtService) =>
                new AuthService(usersRepository, authRepository, jwtService),
        },
    ],
})
export class AuthModule {}
