import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../../users/domain/user.model';
import { AuthAdapter } from '../adapters/auth.adapter';
import { UsersRepository } from '../../users/domain/users.abstract.repository';
import { AuthRepository } from '../domain/auth.abstract.repository';
import { LogInSignInDtoOutput } from '../controllers/dto/auth.dto';
import { CochonError } from '../../../utils/CochonError';
import { UserTokenEntity } from '../../../core/entities/user-tokens.entity';

export class AuthService {
    constructor(
        private userRepository: UsersRepository,
        private authRepository: AuthRepository,
        private jwtService: JwtService
    ) {}

    public async signIn(
        firstName: string,
        lastName: string,
        phone: string,
        email: string,
        address: string,
        password: string,
        description: string
    ): Promise<LogInSignInDtoOutput> {
        const isUserExist = await this.userRepository.findByEmail(email);
        const isPhoneExist = await this.userRepository.findByPhone(phone);
        if (isUserExist || isPhoneExist) {
            throw new CochonError('account-already-exist', 'Account already exist', 400);
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const prevUser: User = {
            id: 0,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            email: email,
            address: address,
            password: hashedPassword,
            description: description,
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

        return AuthAdapter.tokensToDtoOutput(accessToken, refreshToken);
    }

    async logout(refresh_token: string): Promise<void> {
        await this.authRepository.deleteToken(refresh_token);
    }

    async refresh(refresh_token: string): Promise<LogInSignInDtoOutput> {
        const decoded: UserTokenEntity = this.jwtService.decode(refresh_token);
        if (!decoded.id) {
            throw new CochonError('invalid-token', 'Invalid token', 400);
        }

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
}
