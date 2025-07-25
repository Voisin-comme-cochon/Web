import { forwardRef, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { UsersRepository } from '../users/domain/users.abstract.repository';
import { MailerModule } from '../mailer/mailer.module';
import { MailerService } from '../mailer/services/mailer.service';
import { ObjectStorageModule } from '../objectStorage/objectStorage.module';
import { ObjectStorageService } from '../objectStorage/services/objectStorage.service';
import { TagsRepository } from '../tags/domain/tags.abstract.repository';
import { TagsModule } from '../tags/tags.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepositoryImplementation } from './repository/auth.repository.implementation';
import { AuthRepository } from './domain/auth.abstract.repository';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.VCC_JWT_SECRET,
        }),
        forwardRef(() => UsersModule),
        MailerModule,
        ObjectStorageModule,
        forwardRef(() => TagsModule),
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
            inject: [AuthRepository, UsersRepository, JwtService, MailerService, ObjectStorageService, TagsRepository],
            useFactory: (
                authRepository: AuthRepository,
                usersRepository: UsersRepository,
                jwtService: JwtService,
                mailerService: MailerService,
                objectStorageService: ObjectStorageService,
                tagRepository: TagsRepository
            ) =>
                new AuthService(
                    usersRepository,
                    authRepository,
                    jwtService,
                    mailerService,
                    objectStorageService,
                    tagRepository
                ),
        },
    ],
    exports: [AuthService, JwtModule],
})
export class AuthModule {}
