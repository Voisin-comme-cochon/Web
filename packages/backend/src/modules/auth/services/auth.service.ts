import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthAdapter } from '../adapters/auth.adapter';
import { UsersRepository } from '../../users/domain/users.abstract.repository';
import { AuthRepository } from '../domain/auth.abstract.repository';
import { LogInSignInDtoOutput } from '../controllers/dto/auth.dto';
import { CochonError } from '../../../utils/CochonError';
import { UserTokenEntity } from '../../../core/entities/user-tokens.entity';
import { MailerService } from '../../mailer/services/mailer.service';
import { Templates } from '../../mailer/domain/templates.enum';
import { ObjectStorageService } from '../../objectStorage/services/objectStorage.service';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';
import { TagsRepository } from '../../tags/domain/tags.abstract.repository';
import { UserEntity } from '../../../core/entities/user.entity';
import { UserTagEntity } from '../../../core/entities/user-tag.entity';
import { isNull } from '../../../utils/tools';
import { CreateAuthModel } from '../domain/auth.model';

interface DecodedToken {
    id: number;
    isSuperAdmin: boolean;
    purpose?: string;
    email?: string;
    iat: number;
    exp: number;
}

export class AuthService {
    constructor(
        private userRepository: UsersRepository,
        private authRepository: AuthRepository,
        private jwtService: JwtService,
        private mailerService: MailerService,
        private objectStorageService: ObjectStorageService,
        private tagRepository: TagsRepository
    ) {}

    public async signIn(data: CreateAuthModel): Promise<LogInSignInDtoOutput> {
        const isUserExist = await this.userRepository.findByEmail(data.email);
        const isPhoneExist = await this.userRepository.findByPhone(data.phone);
        if (isUserExist || isPhoneExist) {
            throw new CochonError('account-already-exist', 'Account already exist', 409);
        }

        const tagIdsArray = data.tagIds.split(',').map(Number);
        if (tagIdsArray.length > 0) {
            for (const tagId of tagIdsArray) {
                const tag = await this.tagRepository.getTagById(tagId);
                if (isNull(tag)) {
                    throw new CochonError('tag-not-found', `Tag with id ${tagId} not found`, 400);
                }
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        let profileImageUrl: string | undefined;
        if (data.profileImage) {
            try {
                profileImageUrl = await this.objectStorageService.uploadFile(
                    data.profileImage.buffer,
                    data.profileImage.originalname,
                    BucketType.PROFILE_IMAGES
                );
            } catch (error) {
                console.error('Error uploading profile image:', error);
            }
        }

        const userEntity = new UserEntity();
        userEntity.firstName = data.firstName;
        userEntity.lastName = data.lastName;
        userEntity.phone = data.phone;
        userEntity.email = data.email;
        userEntity.address = data.address;
        userEntity.latitude = data.latitude;
        userEntity.longitude = data.longitude;
        userEntity.password = hashedPassword;
        userEntity.description = data.description;
        userEntity.profileImageUrl = profileImageUrl;
        userEntity.isSuperAdmin = false;
        userEntity.newsletter = false;
        userEntity.prefferedNotifMethod = 'email';

        if (tagIdsArray.length > 0) {
            userEntity.tags = tagIdsArray.map((tagId) => {
                const userTag = new UserTagEntity();
                userTag.tagId = tagId;
                return userTag;
            });
        }

        const user = await this.userRepository.createUser(userEntity);
        const accessToken = this.jwtService.sign(
            { id: user.id, isSuperAdmin: user.isSuperAdmin },
            {
                expiresIn: '5m',
            }
        );

        const refreshToken = this.jwtService.sign(
            { id: user.id, isSuperAdmin: user.isSuperAdmin },
            {
                expiresIn: '15d',
            }
        );

        await this.authRepository.saveToken(refreshToken, user.id);

        try {
            await this.mailerService.sendRawEmail({
                to: [user.email],
                subject: 'Bienvenue sur Voisin comme Cochon !',
                template: Templates.WELCOME,
                context: {
                    name: user.firstName,
                    profileLink: `${process.env.VCC_FRONT_URL ?? 'http://localhost:8080'}/profile`,
                    communityLink: `${process.env.VCC_FRONT_URL ?? 'http://localhost:8080'}/community`,
                    supportEmail: process.env.VCC_SUPPORT_EMAIL,
                },
            });
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }

        return AuthAdapter.tokensToDtoOutput(accessToken, refreshToken);
    }

    async logout(refresh_token: string): Promise<void> {
        await this.authRepository.deleteToken(refresh_token);
    }

    async refresh(refresh_token: string): Promise<LogInSignInDtoOutput> {
        const decoded: UserTokenEntity = this.jwtService.decode(refresh_token);

        const isTokenExist = await this.authRepository.getToken(refresh_token);
        if (!isTokenExist) {
            throw new CochonError('invalid-token', 'Invalid token', 400);
        }

        const user = await this.userRepository.getUserById(decoded.id);
        if (!user) {
            throw new CochonError('user-not-found', 'User not found', 404);
        }

        const tokens = await this.authRepository.getTokensByUserId(user.id);
        if (!tokens.some((token) => token.token === refresh_token)) {
            throw new CochonError('invalid-token', 'Invalid token', 400);
        }

        const accessToken = this.jwtService.sign(
            { id: user.id, isSuperAdmin: user.isSuperAdmin },
            {
                expiresIn: '5m',
            }
        );

        const newRefreshToken = this.jwtService.sign(
            { id: user.id, isSuperAdmin: user.isSuperAdmin },
            {
                expiresIn: '15d',
            }
        );

        await this.authRepository.deleteToken(refresh_token);

        await this.authRepository.saveToken(newRefreshToken, user.id);

        return AuthAdapter.tokensToDtoOutput(accessToken, newRefreshToken);
    }

    public async getTokensById(id: number): Promise<UserTokenEntity[]> {
        return await this.authRepository.getTokensByUserId(id);
    }

    public async logIn(email: string, password: string): Promise<LogInSignInDtoOutput> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new CochonError('user-not-found', 'Incorrect email or password', 400);
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new CochonError('user-not-found', 'Incorrect email or password', 400);
        }

        const accessToken = this.jwtService.sign(
            { id: user.id, isSuperAdmin: user.isSuperAdmin },
            {
                expiresIn: '5m',
            }
        );

        const refreshToken = this.jwtService.sign(
            { id: user.id, isSuperAdmin: user.isSuperAdmin },
            {
                expiresIn: '15d',
            }
        );

        await this.authRepository.saveToken(refreshToken, user.id);

        return AuthAdapter.tokensToDtoOutput(accessToken, refreshToken);
    }

    public async requestPasswordReset(email: string): Promise<{ message: string }> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            // We return success to prevent email enumeration
            return { message: 'Password reset email sent' };
        }

        const resetToken = this.jwtService.sign(
            {
                id: user.id,
                email: user.email,
                purpose: 'password-reset',
            },
            {
                expiresIn: '1h',
            }
        );

        const resetLink = `${process.env.VCC_FRONT_URL ?? 'http://localhost:8080'}/reset-password?token=${resetToken}`;

        try {
            await this.mailerService.sendRawEmail({
                to: [user.email],
                subject: 'Réinitialisation de votre mot de passe',
                template: Templates.RESET_PASSWORD,
                context: {
                    name: user.firstName,
                    resetLink: resetLink,
                },
            });
        } catch (error) {
            console.error('Failed to send password reset email:', error);
        }

        return { message: 'Password reset email sent' };
    }

    public async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        try {
            const decoded = this.jwtService.verify<DecodedToken>(token);

            if (decoded.purpose !== 'password-reset') {
                throw new CochonError('invalid-token', 'Invalid token purpose', 400);
            }

            const user = await this.userRepository.getUserById(decoded.id);
            if (!user) {
                throw new CochonError('user-not-found', 'User not found', 404);
            }

            if (decoded.email !== user.email) {
                throw new CochonError('invalid-token', 'Token does not match user', 400);
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await this.userRepository.updateUserPassword(user.id, hashedPassword);

            return { message: 'Password reset successful' };
        } catch (error) {
            if (error instanceof CochonError) {
                throw error;
            }

            throw new CochonError('invalid-token', 'Invalid or expired token', 400);
        }
    }
}
