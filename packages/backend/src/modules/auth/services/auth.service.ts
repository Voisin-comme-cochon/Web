import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../../users/domain/user.model';
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
        private objectStorageService: ObjectStorageService
    ) {}

    public async signIn(
        firstName: string,
        lastName: string,
        phone: string,
        email: string,
        address: string,
        password: string,
        description?: string,
        profileImage?: Express.Multer.File
    ): Promise<LogInSignInDtoOutput> {
        const isUserExist = await this.userRepository.findByEmail(email);
        const isPhoneExist = await this.userRepository.findByPhone(phone);
        if (isUserExist || isPhoneExist) {
            throw new CochonError('account-already-exist', 'Account already exist', 409);
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let profileImageUrl: string | undefined;

        if (profileImage) {
            try {
                profileImageUrl = await this.objectStorageService.uploadFile(
                    profileImage.buffer,
                    profileImage.originalname,
                    BucketType.PROFILE_IMAGES
                );
            } catch (error) {
                console.error('Error uploading profile image:', error);
            }
        }

        const prevUser: User = {
            id: 0,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            email: email,
            address: address,
            password: hashedPassword,
            description: description,
            profileImageUrl: profileImageUrl,
            isSuperAdmin: false,
            newsletter: false,
            prefferedNotifMethod: 'email',
        };
        const user = await this.userRepository.createUser(prevUser);
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
                expiresIn: '30s',
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
